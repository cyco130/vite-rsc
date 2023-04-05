import {
	createFromFetch,
	encodeReply as encodeActionArgs,
	createFromReadableStream,
} from "react-server-dom-webpack/client.browser";

const decoder = new TextDecoder();

declare global {
	interface Window {
		init_rsc: ReadableStream<Uint8Array> | null;
		rsc_chunk(chunk: string): Promise<void>;
	}
}

export async function callServer(id: string, args: any[]) {
	const actionId = id;

	const response = fetch("", {
		method: "POST",
		headers: { Accept: "text/x-component", "x-action": actionId },
		body: await encodeActionArgs(args),
	});

	return createFromFetch(response);
}

export function createElementFromRSCFetch(url: string) {
	return createFromFetch(
		fetch(`/__rsc${url}`, {
			headers: {
				Accept: "text/x-component",
				"x-navigate": url,
			},
		}),
	);
}

function createDevtoolsStream() {
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
	config: any,
) {
	stream = await stream;
	if (import.meta.env.DEV) {
		const devtoolsStream = createDevtoolsStream();
		stream = stream.pipeThrough(devtoolsStream);
	}

	return createFromReadableStream(stream, config);
}

export function getRSCStream(url: string) {
	let stream;
	// Ideally we should have a readable stream inlined in the HTML
	if (window.init_rsc) {
		stream = window.init_rsc;
		self.init_rsc = null;
	} else {
		stream = fetch(`/__rsc${url}`, {
			headers: {
				Accept: "text/x-component",
				"x-navigate": url,
			},
		}).then((res) => res.body!);
	}

	return stream;
}

const rscCache = new Map<string, Promise<JSX.Element>>();

export function useRSCStream(url: string) {
	if (!rscCache.has(url)) {
		rscCache.set(
			url,
			createElementFromRSCStream(getRSCStream(url), {
				callServer,
			}),
		);
	}
	return rscCache.get(url)!;
}
