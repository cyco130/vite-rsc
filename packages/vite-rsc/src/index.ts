import type { Plugin } from "vite";
import { moduleResolve } from "import-meta-resolve";
import { fileURLToPath } from "node:url";

export function rsc(): Plugin {
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
				!resolved.id.includes("node_modules")
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

			// Does it have "use client"?
			if (code.match(/^\s*[\'\"]use client[\'\"]/)) {
				const componentId = JSON.stringify(id.slice(0, -4));

				return `
					export default Object.defineProperties({} as any, {
						$$typeof: { value: Symbol.for("react.client.reference") },
						$$id: { value: ${componentId} },
						$$async: { value: false },
					});
				`;
			}

			if (code.match(/^\s*[\'\"]use server[\'\"]/)) {
				const componentId = JSON.stringify(`${id.slice(0, -4)}#default`);

				return (
					code +
					`
					Object.defineProperties(serverFn, {
						$$typeof: { value: Symbol.for("react.server.reference") },
						$$id: { value: ${componentId} },
						$$bound: { value: null },
					});
				`
				);
			}

			return code;
		},
	};
}

// export default Object.defineProperties({} as any, {
// 	$$typeof: { value: Symbol.for("react.client.reference") },
// 	$$id: { value: "Counter" },
// 	$$async: { value: false },
// });
