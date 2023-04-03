import { rsc } from "@vite-rsc/plugin";
import { hattip } from "@hattip/vite";
import type { Plugin } from "vite";
import path from "node:path";

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
		hattip({
			clientConfig: {},
			hattipEntry: "@vite-rsc/router/entry-server",
		}),
		rsc(),
	];
}

export default react;
