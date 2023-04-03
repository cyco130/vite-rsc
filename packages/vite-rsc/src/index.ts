import { parse } from "acorn-loose";
import type { Plugin } from "vite";
import { moduleResolve } from "import-meta-resolve";
import { fileURLToPath } from "node:url";

export function reactServerComponents(): Plugin {
	let root: string;

	return {
		name: "react-server-components",

		enforce: "pre",

		configResolved(config) {
			root = config.root;
		},

		async resolveId(id, importer, options) {
			if (!importer?.endsWith("?rsc")) return;

			const resolved = await this.resolve(id, importer, {
				...options,
				skipSelf: true,
			});

			if (!resolved) return;

			if (
				resolved.id.startsWith(root) &&
				!resolved.external &&
				!resolved.id.includes("/node_modules/")
			) {
				return resolved.id + "?rsc";
			}

			if (!resolved.external) return resolved.id + "?rsc";

			if (resolved.id.startsWith("node:")) return resolved;

			const url = importer.includes(":")
				? new URL(importer)
				: new URL(`file://${importer}`);

			const resolvedUrl = await moduleResolve(
				id,
				url,
				new Set(["node", "import", "react-server"]),
				false,
			);

			const resolvedId = fileURLToPath(resolvedUrl);

			return {
				id: resolvedId + "?rsc",
				external: true,
			};
		},

		transform(code, id, options) {
			if (!id.endsWith("?rsc") || !options?.ssr) return;

			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this;

			return transformModuleIfNeeded(code, id.slice(0, -4));

			async function transformModuleIfNeeded(
				code: string,
				id: string,
			): Promise<string> {
				// Do a quick check for the exact string. If it doesn't exist, don't
				// bother parsing.
				if (
					code.indexOf("use client") === -1 &&
					code.indexOf("use server") === -1
				) {
					return code;
				}

				const body = parse(code, {
					ecmaVersion: "2024",
					sourceType: "module",
				}).body;

				let useClient = false;
				let useServer = false;
				for (let i = 0; i < body.length; i++) {
					const node = body[i];
					if (node.type !== "ExpressionStatement" || !node.directive) {
						break;
					}
					if (node.directive === "use client") {
						useClient = true;
					}
					if (node.directive === "use server") {
						useServer = true;
					}
				}

				if (!useClient && !useServer) {
					return code;
				}

				if (useClient && useServer) {
					throw new Error(
						'Cannot have both "use client" and "use server" directives in the same file.',
					);
				}

				if (useClient) {
					return transformClientModule(body, id);
				}

				return transformServerModule(code, body, id);
			}

			async function transformClientModule(
				ast: any,
				id: string,
			): Promise<string> {
				const names: Array<string> = [];

				await parseExportNamesInto(ast, names, id);

				let newSrc =
					"const CLIENT_REFERENCE = Symbol.for('react.client.reference');\n";
				for (let i = 0; i < names.length; i++) {
					const name = names[i];
					if (name === "default") {
						newSrc += "export default ";
						newSrc += "Object.defineProperties(function() {";
						newSrc +=
							"throw new Error(" +
							JSON.stringify(
								`Attempted to call the default export of ${id} from the server` +
									`but it's on the client. It's not possible to invoke a client function from ` +
									`the server, it can only be rendered as a Component or passed to props of a` +
									`Client Component.`,
							) +
							");";
					} else {
						newSrc += "export const " + name + " = ";
						newSrc += "Object.defineProperties(function() {";
						newSrc +=
							"throw new Error(" +
							JSON.stringify(
								`Attempted to call ${name}() from the server but ${name} is on the client. ` +
									`It's not possible to invoke a client function from the server, it can ` +
									`only be rendered as a Component or passed to props of a Client Component.`,
							) +
							");";
					}
					newSrc += "},{";
					newSrc += "$$typeof: {value: CLIENT_REFERENCE},";
					newSrc += "$$id: {value: " + JSON.stringify(id + "#" + name) + "}";
					newSrc += "});\n";
				}
				return newSrc;
			}

			function transformServerModule(
				source: string,
				ast: any,
				id: string,
			): string {
				// If the same local name is exported more than once, we only need one of the names.
				const localNames: Map<string, string> = new Map();
				const localTypes: Map<string, string> = new Map();

				for (let i = 0; i < ast.length; i++) {
					const node = ast[i];
					switch (node.type) {
						case "ExportAllDeclaration":
							// If export * is used, the other file needs to explicitly opt into "use server" too.
							break;
						case "ExportDefaultDeclaration":
							if (node.declaration.type === "Identifier") {
								localNames.set(node.declaration.name, "default");
							} else if (node.declaration.type === "FunctionDeclaration") {
								if (node.declaration.id) {
									localNames.set(node.declaration.id.name, "default");
									localTypes.set(node.declaration.id.name, "function");
								} else {
									// TODO: This needs to be rewritten inline because it doesn't have a local name.
								}
							}
							continue;
						case "ExportNamedDeclaration":
							if (node.declaration) {
								if (node.declaration.type === "VariableDeclaration") {
									const declarations = node.declaration.declarations;
									for (let j = 0; j < declarations.length; j++) {
										addLocalExportedNames(localNames, declarations[j].id);
									}
								} else {
									const name = node.declaration.id.name;
									localNames.set(name, name);
									if (node.declaration.type === "FunctionDeclaration") {
										localTypes.set(name, "function");
									}
								}
							}
							if (node.specifiers) {
								const specifiers = node.specifiers;
								for (let j = 0; j < specifiers.length; j++) {
									const specifier = specifiers[j];
									localNames.set(specifier.local.name, specifier.exported.name);
								}
							}
							continue;
					}
				}

				let newSrc = source + "\n\n;";
				localNames.forEach(function (exported, local) {
					if (localTypes.get(local) !== "function") {
						// We first check if the export is a function and if so annotate it.
						newSrc += "if (typeof " + local + ' === "function") ';
					}
					newSrc += "Object.defineProperties(" + local + ",{";
					newSrc += '$$typeof: {value: Symbol.for("react.server.reference")},';
					newSrc +=
						"$$id: {value: " + JSON.stringify(id + "#" + exported) + "},";
					newSrc += "$$bound: { value: null }";
					newSrc += "});\n";
				});
				return newSrc;
			}

			async function parseExportNamesInto(
				ast: any,
				names: Array<string>,
				parentURL: string,
			): Promise<void> {
				for (let i = 0; i < ast.length; i++) {
					const node = ast[i];
					switch (node.type) {
						case "ExportAllDeclaration":
							if (node.exported) {
								addExportNames(names, node.exported);
								continue;
							} else {
								const { url } = await resolveClientImport(
									node.source.value,
									parentURL,
								);
								const { code } = await self.load({ id: url });

								const childBody = parse(code ?? "", {
									ecmaVersion: "2024",
									sourceType: "module",
								}).body;

								await parseExportNamesInto(childBody, names, url);
								continue;
							}
						case "ExportDefaultDeclaration":
							names.push("default");
							continue;
						case "ExportNamedDeclaration":
							if (node.declaration) {
								if (node.declaration.type === "VariableDeclaration") {
									const declarations = node.declaration.declarations;
									for (let j = 0; j < declarations.length; j++) {
										addExportNames(names, declarations[j].id);
									}
								} else {
									addExportNames(names, node.declaration.id);
								}
							}
							if (node.specifiers) {
								const specifiers = node.specifiers;
								for (let j = 0; j < specifiers.length; j++) {
									addExportNames(names, specifiers[j].exported);
								}
							}
							continue;
					}
				}
			}

			function addLocalExportedNames(names: Map<string, string>, node: any) {
				switch (node.type) {
					case "Identifier":
						names.set(node.name, node.name);
						return;
					case "ObjectPattern":
						for (let i = 0; i < node.properties.length; i++)
							addLocalExportedNames(names, node.properties[i]);
						return;
					case "ArrayPattern":
						for (let i = 0; i < node.elements.length; i++) {
							const element = node.elements[i];
							if (element) addLocalExportedNames(names, element);
						}
						return;
					case "Property":
						addLocalExportedNames(names, node.value);
						return;
					case "AssignmentPattern":
						addLocalExportedNames(names, node.left);
						return;
					case "RestElement":
						addLocalExportedNames(names, node.argument);
						return;
					case "ParenthesizedExpression":
						addLocalExportedNames(names, node.expression);
						return;
				}
			}

			function addExportNames(names: Array<string>, node: any) {
				switch (node.type) {
					case "Identifier":
						names.push(node.name);
						return;
					case "ObjectPattern":
						for (let i = 0; i < node.properties.length; i++)
							addExportNames(names, node.properties[i]);
						return;
					case "ArrayPattern":
						for (let i = 0; i < node.elements.length; i++) {
							const element = node.elements[i];
							if (element) addExportNames(names, element);
						}
						return;
					case "Property":
						addExportNames(names, node.value);
						return;
					case "AssignmentPattern":
						addExportNames(names, node.left);
						return;
					case "RestElement":
						addExportNames(names, node.argument);
						return;
					case "ParenthesizedExpression":
						addExportNames(names, node.expression);
						return;
				}
			}

			async function resolveClientImport(
				specifier: string,
				parentURL: string,
			): Promise<{ url: string }> {
				const resolved = await self.resolve(specifier, parentURL, {
					skipSelf: true,
				});

				if (!resolved) {
					throw new Error(
						"Could not resolve " + specifier + " from " + parentURL,
					);
				}

				return { url: resolved.id };
			}
		},
	};
}
