import { createFromReadableStream } from "react-server-dom-webpack/client.browser";
import { hydrateRoot } from "react-dom/client";
import { createElement, startTransition, use } from "react";

import "../devtools/devtools.client";

mount().catch((err) => console.error(err));

const decoder = new TextDecoder();

async function mount() {
	let url = new URL(location.href);
	let callbacks = [];

	function createHrefFromUrl(
		url: Pick<URL, "pathname" | "search" | "hash">,
		includeHash: boolean = true,
	): string {
		return url.pathname + url.search + (includeHash ? url.hash : "");
	}

	const router = {
		push(url: string) {},
		navigate(url: string) {
			window.history.replaceState({}, "", url);
		},
	};

	async function fetchRSC() {
		let stream = await fetch(`/__rsc${url.pathname}`).then((res) => res.body!);
		let previousChunkTime: number | null = null;
		let transformStream = new TransformStream({
			transform(chunk, controller) {
				const currentTime = Date.now();

				if (previousChunkTime !== null) {
					const timeDifference = currentTime - previousChunkTime;
					console.log(
						`Time difference from previous chunk: ${timeDifference}ms`,
					);
				} else {
					console.log("Received the first chunk");
				}

				console.log(`Chunk: ${decoder.decode(chunk)}`);
				previousChunkTime = currentTime;

				// Pass the chunk along the stream without modification
				controller.enqueue(chunk);
			},
		});

		return await createFromReadableStream(stream.pipeThrough(transformStream), {
			callServer(...args: any[]) {
				console.log(args);
				throw new Error("Not implemented");
			},
		});
	}

	const responseCache = new Map<string, any>();

	function Router() {
		return <ServerResponse />;
	}

	function ServerResponse() {
		if (!responseCache.has("rsc")) {
			responseCache.set("rsc", fetchRSC());
		}
		return use(responseCache.get("rsc")) as any;
	}

	startTransition(() => {
		hydrateRoot(document.body!, createElement(Router));
	});
}

const cache = new Map<string, any>();

(globalThis as any).__webpack_chunk_load__ = async (chunk: string) => {
	console.log("Loading chunk", chunk);
	cache.set(chunk, await import(/* @vite-ignore */ chunk));
};

(globalThis as any).__webpack_require__ = (id: string) => {
	console.log("Requiring chunk", id);
	if (!cache.has(id)) throw new Error(`Module ${id} not found`);
	return cache.get(id);
};
