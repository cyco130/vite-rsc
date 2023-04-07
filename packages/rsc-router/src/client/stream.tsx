import {
	createFromFetch,
	encodeReply as encodeActionArgs,
	createFromReadableStream,
} from "react-server-dom-webpack/client.browser";

declare global {
	interface Window {
		init_rsc: ReadableStream<Uint8Array> | null;
		rsc_chunk(chunk: string): Promise<void>;
	}
}

export async function callServer(id: string, args: any[]) {
	const actionId = id;

	const isMutating = !!globalThis.isMutating;

	const response = await fetch("", {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"x-action": actionId,
			"x-mutation": isMutating ? "1" : "0",
		},
		body: await encodeActionArgs(args),
	});

	if (!response.ok) {
		throw new Error("Server error");
	}

	const data = createFromReadableStream(response.body!, { callServer });

	if (isMutating) {
		globalThis.mutate(data);
	}

	return data;
}

export function createElementFromRSCFetch(url = "") {
	return createFromFetch(
		fetch(url, {
			headers: {
				Accept: "text/x-component",
				"x-rsc": "1",
				"x-navigate": url,
			},
		}),
		{ callServer },
	);
}

function createDevtoolsStream() {
	const decoder = new TextDecoder();
	let previousChunkTime: number | null = null;
	const transformStream = new TransformStream({
		transform(chunk, controller) {
			const currentTime = Date.now();

			if (previousChunkTime !== null) {
				const timeDifference = currentTime - previousChunkTime;
				console.log(`Time difference from previous chunk: ${timeDifference}ms`);
			} else {
				console.log("Received the first chunk");
			}

			console.log(`Chunk: ${decoder.decode(chunk)}`);
			previousChunkTime = currentTime;

			// Pass the chunk along the stream without modification
			controller.enqueue(chunk);
		},
	});
	return transformStream;
}

export async function createElementFromRSCStream(
	stream: ReadableStream | Promise<ReadableStream>,
	config: {
		callServer: any;
	},
) {
	stream = await stream;
	if (import.meta.env.DEV) {
		const devtoolsStream = createDevtoolsStream();
		stream = stream.pipeThrough(devtoolsStream);
	}

	return createFromReadableStream(stream, config);
}
