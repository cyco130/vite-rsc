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
			if (!importer?.endsWith("?RSC")) return;

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
				return resolved.id + "?RSC";
			}

			if (!resolved.external) return resolved.id + "?RSC";

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
				id: resolvedId + "?RSC",
				external: true,
			};
		},

		transform(code, id, options) {
			if (!id.endsWith("?RSC") || !options?.ssr) return;

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

			return code;
		},
	};
}

export default Object.defineProperties({} as any, {
	$$typeof: { value: Symbol.for("react.client.reference") },
	$$id: { value: "Counter" },
	$$async: { value: false },
});
