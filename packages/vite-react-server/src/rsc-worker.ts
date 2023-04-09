/// <reference types="node" />

import { parentPort, workerData } from "node:worker_threads";
import { createServer } from "vite";
import * as React from "react";
import RSDWServer from "react-server-dom-webpack/server.edge";
import { ViteNodeServer } from "vite-node/server";

// create vite server
const server = await createServer({
	optimizeDeps: {
		// It's recommended to disable deps optimization
		disabled: true,
	},
});
// this is need to initialize the plugins
await server.pluginContainer.buildStart({});

// create vite-node server
const node = new ViteNodeServer(server);

parentPort.addListener("message", handleMessage);
parentPort.postMessage("ready");

async function handleMessage(msg) {
	const event = JSON.parse(msg);
	console.log(msg);

	const { default: entry } = await server.ssrLoadModule(
		process.cwd() + "/" + "app/entry-rsc.tsx",
	);

	console.log(entry(event));

	// const { id, type, payload } = event;

	// const url = new URL(payload.url);

	// const passthrough = new PassThrough({
	// 	transform(chunk, _, callback) {
	// 		parentPort.postMessage(
	// 			JSON.stringify({
	// 				id,
	// 				type: "data",
	// 				payload: chunk.toString(),
	// 			}),
	// 		);
	// 		callback(null, chunk);
	// 	},
	// 	destroy(error, callback) {
	// 		if (error) {
	// 			parentPort.postMessage(
	// 				JSON.stringify({
	// 					id,
	// 					type: "error",
	// 				}),
	// 			);
	// 		}
	// 		callback(error);
	// 	},
	// 	final(callback) {
	// 		parentPort.postMessage(
	// 			JSON.stringify({
	// 				id,
	// 				type: "end",
	// 			}),
	// 		);
	// 		callback();
	// 	},
	// });

	// Render the RSC chunks and pipe them through the passthrough stream
	// to relay up to the parent thread.
	// RSDWServer.renderToPipeableStream(
	// 	React.createElement(Router, {
	// 		trie,
	// 		url,
	// 	}),
	// 	manifest,
	// ).pipe(passthrough);
}
