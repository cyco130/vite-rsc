import { reactServerComponents } from "vite-rsc";
import { hattip } from "@hattip/vite";
import type { Plugin } from "vite";
import path from "node:path";
import inspect from "vite-plugin-inspect";
import { tsconfigPaths } from "vite-rsc/tsconfig-paths";
import { exposeDevServer } from "./vite-dev-server";
import reactRefresh from "@vitejs/plugin-react";
function config() {
	return {
		name: "vite-react-server-config",
		config(config, env) {
			config.build ||= {};
			config.build.manifest = true;

			if (env.ssrBuild) {
				if (config.build.ssr === true) {
					config.build.rollupOptions ||= {};
					config.build.rollupOptions.input = "/app/entry-server";
				}
				config.build.outDir ||= "dist/server";
				config.build.ssrEmitAssets = true;
			} else {
				config.build.outDir ||= "dist/static";
				config.build.ssrManifest = true;
				config.build.rollupOptions ||= {};
				config.build.rollupOptions.input ||= "/app/entry-client";
			}

			const root = config.root ?? process.cwd();
			return {
				resolve: {
					alias: {
						app: path.resolve(root, "app"),
						"~": path.resolve(root, "app"),
					},
				},
				ssr: {
					external: ["react-server-dom-webpack"],
					noExternal: ["flight-router", "stream-react"],
				},
			};
		},
	} satisfies Plugin;
}

export function react({
	server = true,
	inspect: _inspect = true,
	reactRefresh: _reactRefresh = false,
	tsconfigPaths: _tsconfigPaths = true,
	serverEntry = "stream-react/entry-server",
} = {}) {
	return [
		{
			name: "flight-router",
			resolveId(src) {
				if (src === "/app/entry-client") {
					return "/app/entry-client.tsx";
				}
			},
			load(src) {
				if (src === "/app/entry-client.tsx") {
					return `
						import { mount, BaseRouter } from "stream-react/web/entry";
						import React from "react";
						mount(<BaseRouter />);
					`;
				}
			},
		} satisfies Plugin,
		_tsconfigPaths && tsconfigPaths(),
		config(),
		_inspect &&
			inspect({
				build: true,
			}),
		_reactRefresh && reactRefresh(),
		server
			? hattip({
					clientConfig: {},
					hattipEntry: serverEntry,
			  })
			: exposeDevServer(),
		reactServerComponents(),
	];
}

export default react;
