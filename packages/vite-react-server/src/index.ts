import { reactServerComponents } from "vite-rsc";
import { hattip } from "@hattip/vite";
import type { Plugin } from "vite";
import path from "node:path";
import inspect from "vite-plugin-inspect";

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
					noExternal: ["@vite-rsc/router"],
				},
			};
		},
	} satisfies Plugin;
}

export function react() {
	return [
		config(),
		inspect(),
		hattip({
			clientConfig: {},
			hattipEntry: "@vite-rsc/router/entry-server",
		}),
		reactServerComponents(),
	];
}

export default react;
