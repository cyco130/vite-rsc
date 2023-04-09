import { reactServerComponents } from "vite-rsc";
import { hattip } from "winterkit";
import type { Plugin } from "vite";
import path, { dirname, join } from "node:path";
import inspect from "vite-plugin-inspect";
import { tsconfigPaths } from "vite-rsc/tsconfig-paths";
import { exposeDevServer } from "./vite-dev-server";
import reactRefresh from "@vitejs/plugin-react";
import { cpSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

function makeDefaultNodeEntry(hattipEntry: string | undefined) {
	if (!hattipEntry) {
		throw new Error("No hattip entry found");
	}

	return `
		import handler from ${JSON.stringify(hattipEntry)};
		import { createMiddleware } from "vite-react-server/node";
		export default createMiddleware(handler);
	`;
}

const _dirname = dirname(fileURLToPath(import.meta.url));

import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";

const require = createRequire(import.meta.url);

// TODO: Use something other than JSON for worker communication.

/**
 * Create a worker thread that will be used to render RSC chunks.
 * @param buildPath Absolute path to the the built RSC bundle.
 */
export async function createRSCWorker(buildPath: string) {
	const rscWorker = require.resolve("./rsc-worker");
	const worker = new Worker(rscWorker, {
		execArgv: ["--conditions", "react-server"],
		env: {
			RSC_WORKER: "true",
		},
		workerData: {
			buildPath,
		},
	});

	await new Promise<void>((resolve, reject) =>
		worker.once("message", (event) => {
			if (event === "ready") {
				resolve();
			} else {
				reject(new Error("rsc worker failed to start"));
			}
		}),
	);
	const responses = new Map<string, ReadableStreamDefaultController>();
	const encoder = new TextEncoder();
	worker.on("message", (msg) => {
		const { id, chunk } = JSON.parse(msg);
		const res = responses.get(id)!;
		if (chunk === "end") {
			res.close();
			responses.delete(id);
			return;
		}

		res.enqueue(encoder.encode(chunk));
	});
	worker.once("exit", (code) => {
		console.log("RSC worker exited with code", code);
		process.exit(code);
	});

	return {
		render(component: string, props: any) {
			debugger;
			console.log("rendering", component, props);
			const id = Math.random() + "";
			worker.postMessage(
				JSON.stringify({
					component,
					props,
					id,
				}),
			);

			return new ReadableStream({
				start(controller) {
					responses.set(id, controller);
				},
			});
		},
	};
}

export function react({
	server = true,
	inspect: _inspect = true,
	reactRefresh: _reactRefresh = false,
	tsconfigPaths: _tsconfigPaths = true,
	serverEntry = "stream-react/entry-server",
	clientEntry = undefined as string | null | undefined,
	appRoot = "app",
} = {}) {
	let isSsrBuild = false;
	return [
		{
			name: "flight-router",
			async configureServer(server) {
				if (!process.env.RSC_WORKER) {
					const rscWorker = await createRSCWorker("");
					// @ts-ignore
					server.rscServer = rscWorker;
					// const stream = rscWorker.render(
					// 	new URL("/", "http://localhost:3000"),
					// );
					// console.log(text(stream).then(console.log));
				}
			},
			config(config, env) {
				const root = config.root ?? process.cwd();
				isSsrBuild = env.ssrBuild ?? false;
				const findAny = (
					path: string,
					name: string,
					exts = [".js", ".ts", ".jsx", ".tsx", ".mjs", ".mts"],
				) => {
					for (const ext of exts) {
						const file = join(path, name + ext);
						if (existsSync(file)) {
							return file;
						}
					}
					return null;
				};

				let clientModules = [];
				if (existsSync(join(root, "dist", "server", "client-manifest.json"))) {
					clientModules = JSON.parse(
						readFileSync(join(root, "dist", "server", "client-manifest.json"), {
							encoding: "utf8",
						}),
					);
				}

				clientEntry =
					clientEntry ?? findAny(join(root, appRoot), "entry-client");
				if (!clientEntry) {
					clientEntry = join(_dirname, "..", "dist", "entry-client.js");
				}

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
					config.build.rollupOptions.treeshake = false;
					config.build.rollupOptions.preserveEntrySignatures = "exports-only";
					config.build.rollupOptions.input ||= [clientEntry, ...clientModules];
				}

				console.log(clientEntry);
				return {
					resolve: {
						alias: {
							"~": path.resolve(root, "app"),

							"~react/entry-client": clientEntry,
						},
					},
					define: {
						"import.meta.env.CLIENT_ENTRY": JSON.stringify(clientEntry),
						"import.meta.env.ROOT_DIR": JSON.stringify(root),
					},
					ssr: {
						external: ["react-server-dom-webpack"],
						noExternal: [
							"flight-router",
							"stream-react",
							"react-error-boundary",
						],
					},
				};
			},
			load(src) {
				if (src === "~root/entry-client.tsx") {
					return `
						import { mount, Router } from "stream-react/web/entry";
						import { Router } from "stream-react/web/router";
						import React from "react";
						mount(<Router />);
					`;
				}
			},
			generateBundle(options) {
				if (!isSsrBuild) {
					cpSync(
						join(process.cwd(), "dist/server/assets/"),
						join(options!.dir!, "assets/"),
						{
							recursive: true,
							filter: (src) => !src.endsWith(".js"),
						},
					);
				}
			},
		} satisfies Plugin,
		_tsconfigPaths && tsconfigPaths(),
		_inspect &&
			inspect({
				build: true,
			}),
		_reactRefresh && reactRefresh(),
		server
			? hattip({
					clientConfig: {},
					hattipEntry: serverEntry,
					devEntry: makeDefaultNodeEntry,
			  })
			: exposeDevServer(),
		reactServerComponents(),
	];
}

export default react;
