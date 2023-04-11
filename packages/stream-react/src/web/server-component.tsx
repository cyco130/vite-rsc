import { createElementFromStream, callServer } from "../client/stream";
import React, { Thenable, use } from "react";

declare global {
	interface Window {
		init_server: ReadableStream<Uint8Array> | null;
		chunk(chunk: string): Promise<void>;
	}
}

export function getServerElementStream(url: string) {
	let stream;
	// Ideally we should have a readable stream inlined in the HTML
	if (window.init_server) {
		stream = window.init_server;
		self.init_server = null;
	} else {
		stream = fetch(`${url}`, {
			headers: {
				Accept: "text/x-component",
				"x-navigate": url,
			},
		}).then((res) => res.body!);
	}

	return stream;
}

export function ServerComponent({ url }: { url: string }) {
	return use(useServerElement(url));
}

export const serverElementCache = /*#__PURE__*/ new Map<
	string,
	Thenable<JSX.Element>
>();

export function useServerElement(url: string) {
	if (!serverElementCache.has(url)) {
		serverElementCache.set(
			url,
			createElementFromStream(getServerElementStream(url), {
				callServer,
			}),
		);
	}
	return serverElementCache.get(url)!;
}
