import { reactServerComponents } from "vite-rsc";
import { hattip } from "@hattip/vite";
import type { Plugin } from "vite";
import path from "node:path";
import inspect from "vite-plugin-inspect";
import { tsconfigPaths } from "vite-rsc/tsconfig-paths";
function config() {
	return {
		name: "vite-react-server-config",
		config(c) {
			const root = c.root ?? process.cwd();
			return {
				resolve: {
					alias: {
						app: path.resolve(root, "app"),
						"~": path.resolve(root, "app"),
					},
				},
				ssr: {
					external: ["react-server-dom-webpack"],
					noExternal: ["rsc-router"],
				},
			};
		},
	} satisfies Plugin;
}

export function react() {
	return [
		{
			name: "rsc-router",
			resolveId(src) {
				if (src === "/app/entry-client") {
					return "/app/entry-client";
				}
			},
			load(src) {
				if (src === "/app/entry-client") {
					return `
						import { mount } from "rsc-router/client/entry";
						mount();
					`;
				}
			},
		} satisfies Plugin,
		tsconfigPaths(),
		config(),
		inspect(),
		hattip({
			clientConfig: {},
			hattipEntry: "rsc-router/entry-server",
		}),
		reactServerComponents(),
	];
}

export default react;
