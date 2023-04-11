import { reactServerComponents } from "vite-rsc";
import { hattip } from "winterkit";
import type { Plugin } from "vite";
import path, { dirname, join } from "node:path";
import inspect from "vite-plugin-inspect";
import { tsconfigPaths } from "vite-rsc/tsconfig-paths";
import { exposeDevServer } from "./vite-dev-server";
import reactRefresh from "@vitejs/plugin-react";
import { cpSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineFileSystemRoutes } from "./fs-router";

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
			// DEBUG: "vite:*",
			NODE_ENV: "production",
			MINIFY: process.argv.includes("--minify") ? "true" : "false",
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
	const responses = new Map<string, (event: any) => void>();
	const encoder = new TextEncoder();
	worker.on("message", (msg) => {
		const { id, ...event } = JSON.parse(msg);
		const res = responses.get(id)!;
		// if (chunk === "end") {
		// 	res.close();
		// 	responses.delete(id);
		// 	return;
		// }

		// if (chunk)

		// res.enqueue(encoder.encode(chunk));
		res(event);
	});
	worker.once("exit", (code) => {
		console.log("RSC worker exited with code", code);
		process.exit(code);
	});

	return {
		render(component: string, props: any) {
			const id = Math.random() + "";
			worker.postMessage(
				JSON.stringify({
					component,
					props,
					type: "render",
					id,
				}),
			);

			return new ReadableStream({
				start(controller) {
					responses.set(id, ({ chunk }) => {
						if (chunk === "end") {
							controller.close();
							responses.delete(id);
							return;
						}

						if (chunk) controller.enqueue(encoder.encode(chunk));
					});
				},
			});
		},
		build: () => {
			return new Promise((resolve) => {
				const id = Math.random() + "";
				responses.set(id, ({ status }) => {
					if (status === "built") {
						resolve("");
					}
				});
				worker.postMessage(
					JSON.stringify({
						type: "build",
						id,
					}),
				);
			});
		},
		close: () => {
			worker.unref();
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
	rscEntry = undefined as string | null | undefined,
	appRoot = "app",
} = {}) {
	let isSsrBuild = false;
	let worker: any;
	return [
		{
			name: "flight-router",
			async configureServer(server) {
				if (!process.env.RSC_WORKER) {
					const rscWorker = await createRSCWorker("");
					// @ts-ignore
					server.rscWorker = rscWorker;
					worker = rscWorker;

					process.on("beforeExit", () => {
						rscWorker.close();
					});

					// const stream = rscWorker.render(
					// 	new URL("/", "http://localhost:3000"),
					// );
					// console.log(text(stream).then(console.log));
				}
			},
			closeWatcher() {
				if (worker) {
					worker.close();
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

				// let clientModules: string[] = [];
				// let serverModules: string[] = [];
				// if (
				// 	existsSync(join(root, "dist", "react-server", "client-manifest.json"))
				// ) {
				// 	clientModules = JSON.parse(
				// 		readFileSync(
				// 			join(root, "dist", "react-server", "client-manifest.json"),
				// 			{
				// 				encoding: "utf8",
				// 			},
				// 		),
				// 	);
				// }

				// if (
				// 	existsSync(join(root, "dist", "react-server", "server-manifest.json"))
				// ) {
				// 	serverModules = JSON.parse(
				// 		readFileSync(
				// 			join(root, "dist", "react-server", "server-manifest.json"),
				// 			{
				// 				encoding: "utf8",
				// 			},
				// 		),
				// 	);
				// }

				clientEntry =
					clientEntry ?? findAny(join(root, appRoot), "entry-client");
				if (!clientEntry) {
					clientEntry = join(_dirname, "..", "dist", "entry-client.js");
				}

				rscEntry = rscEntry ?? findAny(join(root, appRoot), "entry-rsc");
				if (!rscEntry) {
					rscEntry = join(_dirname, "..", "dist", "entry-rsc.production.js");
				}

				config.build ||= {};

				if (env.ssrBuild) {
					if (!process.env.RSC_WORKER) {
						if (config.build.ssr === true) {
							config.build.rollupOptions ||= {};
							config.build.rollupOptions.input ||= {
								index: "/virtual:vavite-connect-server",
							};
						}
						config.build.outDir ||= "dist/server";
						config.build.ssrEmitAssets = true;
						config.build.manifest = true;
					} else {
						config.build.rollupOptions ||= {};
						config.build.rollupOptions.input = {};

						config.build.manifest = true;

						const routesConfig = defineFileSystemRoutes(
							path.join(root, appRoot),
						);

						config.build.rollupOptions.input["react-server"] = rscEntry;
						config.build.rollupOptions.input["root"] = "/app/root";

						Object.entries(routesConfig).forEach(([name, route]) => {
							let chunkName = name.replaceAll(":", "_").replaceAll("/", "_");
							chunkName = chunkName.length > 0 ? chunkName : "root-layout";
							// @ts-ignore
							config.build!.rollupOptions!.input[chunkName] = route.file;
						});

						config.build.outDir ||= "dist/react-server";
						config.build.ssrEmitAssets = true;
					}
				} else {
					config.build.outDir ||= "dist/static";
					config.build.ssrManifest = true;
					config.build.rollupOptions ||= {};
					config.build.rollupOptions.treeshake = false;
					config.build.rollupOptions.preserveEntrySignatures = "exports-only";
					config.build.rollupOptions.input ||= [clientEntry];
					config.build.manifest = true;
				}

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
						"import.meta.env.REACT_SERVER_PROD_ENTRY": JSON.stringify(
							"dist/server/react-server/react-server.js",
						),
						"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
					},
					ssr: {
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
			async buildStart(options) {
				const root = process.cwd();

				if (isSsrBuild) {
					if (!process.env.RSC_WORKER) {
						worker = await createRSCWorker("");
						const built = await worker.build();
						let clientModules: string[] = [];
						let serverModules: string[] = [];
						if (
							existsSync(
								join(root, "dist", "react-server", "client-manifest.json"),
							)
						) {
							clientModules = JSON.parse(
								readFileSync(
									join(root, "dist", "react-server", "client-manifest.json"),
									{
										encoding: "utf8",
									},
								),
							);
						}

						if (
							existsSync(
								join(root, "dist", "react-server", "server-manifest.json"),
							)
						) {
							serverModules = JSON.parse(
								readFileSync(
									join(root, "dist", "react-server", "server-manifest.json"),
									{
										encoding: "utf8",
									},
								),
							);
						}

						options.input = {
							...options.input,
							...Object.fromEntries([
								...clientModules.map((m) => [path.basename(m), m]),
								...serverModules.map((m) => [path.basename(m), m]),
							]),
						};
					}
				} else {
					let clientModules: string[] = [];
					if (
						existsSync(
							join(root, "dist", "react-server", "client-manifest.json"),
						)
					) {
						clientModules = JSON.parse(
							readFileSync(
								join(root, "dist", "react-server", "client-manifest.json"),
								{
									encoding: "utf8",
								},
							),
						);
					}

					// @ts-ignore
					options.input.push(...clientModules);
				}
			},

			async buildEnd() {
				if (!process.env.RSC_WORKER && isSsrBuild) {
					worker.close();
				}
			},
			generateBundle(options) {
				if (isSsrBuild) {
					console.log("copying");
					cpSync("dist/react-server", "dist/server/react-server", {
						recursive: true,
					});
				}
				if (!isSsrBuild) {
					if (existsSync(join(process.cwd(), "dist/server/assets/"))) {
						cpSync(
							join(process.cwd(), "dist/server/assets/"),
							join(options!.dir!, "assets/"),
							{
								recursive: true,
								filter: (src) => !src.endsWith(".js"),
							},
						);
					}

					if (
						existsSync(join(process.cwd(), "dist/server/react-server/assets/"))
					) {
						cpSync(
							join(process.cwd(), "dist/server/react-server/assets/"),
							join(options!.dir!, "assets/"),
							{
								recursive: true,
								filter: (src) => !src.endsWith(".js"),
							},
						);
					}
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
