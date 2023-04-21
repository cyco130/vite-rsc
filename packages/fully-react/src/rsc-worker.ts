/// <reference types="node" />

import { ViteDevServer, build, createServer } from "vite";
import { existsSync, readFileSync } from "node:fs";

import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parentPort } from "node:worker_threads";

// create vite server
let server: ViteDevServer;

parentPort?.addListener("message", handleMessage);
parentPort?.postMessage("ready");

async function handleMessage(msg: string) {
	const event = JSON.parse(msg);

	if (event.type === "render") {
		if (!server) {
			server = await createServer({
				optimizeDeps: {
					// It's recommended to disable deps optimization
					disabled: true,
				},
				plugins: [
					{
						name: "fully-react-hmr",
						handleHotUpdate(ctx) {
							console.log(ctx);
							parentPort?.postMessage(JSON.stringify({ type: "reload" }));
						},
					},
				],
			});

			// this is need to initialize the plugins
			await server.pluginContainer.buildStart({});
		}

		const { default: entry } = await server.ssrLoadModule(
			fileURLToPath(new URL("./entry-rsc.development.js", import.meta.url)),
		);

		function streamToMessageChannel(
			stream: ReadableStream,
			onMessage: (message: string) => void,
		) {
			const forwardReader = stream.getReader();

			const textDecoder = new TextDecoder();

			function read() {
				forwardReader.read().then(({ done, value }) => {
					if (done) {
						onMessage("end");
					} else {
						onMessage(textDecoder.decode(value));
						read();
					}
				});
			}
			read();
		}

		try {
			const stream = await entry(event.src, event.props);

			streamToMessageChannel(stream, (msg) => {
				parentPort?.postMessage(JSON.stringify({ chunk: msg, id: event.id }));
			});
		} catch (e) {
			console.error(e);
		}
	} else if (event.type === "build") {
		await build({
			build: {
				ssr: true,
				target: "node18",
				manifest: true,
				ssrManifest: true,
				minify: process.env.MINIFY === "true",
				rollupOptions: {
					treeshake: true,
					external: [
						"node:path",
						"node:fs",
						"node:async_hooks",
						"node:url",
						"@prisma/client",
						"@auth/core",
						"fs",
						"path",
						"url",
					],
				},
			},
			resolve: {
				conditions: ["node", "import", "react-server", "production"],
			},
			ssr: {
				noExternal: true,
			},
		});
		const root = process.cwd();
		let clientModules: string[] = [];
		let serverModules: string[] = [];
		if (
			existsSync(join(root, "dist", "react-server", "client-manifest.json"))
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
			existsSync(join(root, "dist", "react-server", "server-manifest.json"))
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
		parentPort?.postMessage(
			JSON.stringify({
				id: event.id,
				status: "built",
				clientModules,
				serverModules,
			}),
		);
	}
}
