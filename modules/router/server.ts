import { createRouter } from "@hattip/router";
import { renderToReadableStream as renderRscToReadableStream } from "react-server-dom-webpack/server.edge";
import { createFromReadableStream } from "react-server-dom-webpack/client.browser";
import { createElement } from "react";
import devServer from "virtual:vite-dev-server";
import type { Manifest } from "vite";
import { renderToReadableStream } from "react-dom/server.edge";
import Root from "../../app/root?rsc";

const router = createRouter();

declare global {
	var moduleCache: Map<string, any>;
	function __webpack_chunk_load__(chunk: string): Promise<void>;
	function __webpack_require__(id: string): any;
}

globalThis.moduleCache = globalThis.moduleCache ?? new Map<string, any>();

globalThis.__webpack_chunk_load__ = async (chunk: string) => {
	globalThis.moduleCache.set(chunk, await import(/* @vite-ignore */ chunk));
};

globalThis.__webpack_require__ = (id: string) => {
	if (!globalThis.moduleCache.has(id))
		throw new Error(`Module ${id} not found`);
	return globalThis.moduleCache.get(id);
};

const bundlerConfig = new Proxy(
	{},
	{
		get(_, prop) {
			return {
				id: prop,
				chunks: [prop],
				name: "default",
			};
		},
	},
);

router.get("/__rsc/*", async (context) => {
	let url = context.url;
	let pathname = url.pathname.slice("/__rsc".length);
	let appUrl = new URL(pathname + url.search, "http://localhost:3000");
	return new Response(
		renderRscToReadableStream(
			createElement(Root, { ...context, url: appUrl }),
			bundlerConfig,
		),
		{
			headers: {
				"Content-Type": "text/x-component",
			},
		},
	);
});

router.get("/*", async (context) => {
	let clientScript = "/modules/router/client.tsx";

	if (!devServer) {
		const manifest: { default: Manifest } = await import(
			// @ts-expect-error: manifest.json is only available at build time
			"../../dist/client/manifest.json"
		);
		clientScript = manifest.default[clientScript.slice(1)].file ?? clientScript;
	}

	const encoder = new TextEncoder();

	let rscStream = renderRscToReadableStream(
		createElement(Root, context),
		bundlerConfig,
	);

	let response = await createFromReadableStream(rscStream);

	const stream = await renderToReadableStream(response, {
		bootstrapModules: [clientScript],
	});

	const transform = new TransformStream({
		start(controller) {
			controller.enqueue(
				encoder.encode(
					`<!DOCTYPE html>
						<html>
							<head>
								<title>RSC Playground</title>
								<link rel="icon" type="image/x-icon" href="/favicon.ico">
							</head>
							<body>`,
				),
			);
		},

		flush(controller) {
			controller.enqueue(encoder.encode(`</body></html>`));
		},
	});

	const output = stream.pipeThrough(transform);

	return new Response(output, {
		headers: { "Content-Type": "text/html" },
	});
});

export default router.buildHandler();
