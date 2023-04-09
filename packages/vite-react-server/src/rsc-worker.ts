/// <reference types="node" />

import { fileURLToPath } from "node:url";
import { parentPort } from "node:worker_threads";
import { createServer } from "vite";

// create vite server
const server = await createServer({
	optimizeDeps: {
		// It's recommended to disable deps optimization
		disabled: true,
	},
});
// this is need to initialize the plugins
await server.pluginContainer.buildStart({});

parentPort?.addListener("message", handleMessage);
parentPort?.postMessage("ready");

async function handleMessage(msg: string) {
	const event = JSON.parse(msg);
	console.log({ msg });

	const { default: entry } = await server.ssrLoadModule(
		fileURLToPath(new URL("./entry-rsc.js", import.meta.url)),
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
		const stream = await entry(event);

		streamToMessageChannel(stream, (msg) => {
			parentPort?.postMessage(JSON.stringify({ chunk: msg, id: event.id }));
		});
	} catch (e) {
		console.error(e);
	}
}
