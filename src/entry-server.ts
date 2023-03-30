import { createRouter } from "@hattip/router";
import { renderToReadableStream as renderRscToReadableStream } from "react-server-dom-webpack/server.edge";
import { createElement } from "react";
import devServer from "virtual:vite-dev-server";
import type { Manifest } from "vite";
import { html } from "@hattip/response";
import { renderToReadableStream } from "react-dom/server.edge";
import { App as AppSsr } from "./App";
// @ts-expect-error
import { App } from "./App?RSC";

const router = createRouter();

router.get("/", async () => {
	let clientScript = "/src/entry-client.ts";

	if (!devServer) {
		const manifest: { default: Manifest } = await import(
			// @ts-expect-error: manifest.json is only available at build time
			"../dist/client/manifest.json"
		);
		clientScript = manifest.default[clientScript.slice(1)].file ?? clientScript;
	}

	const stream = await renderToReadableStream(createElement(AppSsr as any), {
		bootstrapModules: [clientScript],
	});

	const encoder = new TextEncoder();

	const transform = new TransformStream({
		start(controller) {
			controller.enqueue(
				encoder.encode(
					`<!DOCTYPE html><html><head><title>RSC Playground</title></head><body><div id="app">`,
				),
			);
		},

		flush(controller) {
			controller.enqueue(encoder.encode(`</div></body></html>`));
		},
	});

	const output = stream.pipeThrough(transform);

	return new Response(output, { headers: { "Content-Type": "text/html" } });
});

router.get(
	"/rsc",
	async () =>
		new Response(
			renderRscToReadableStream(
				createElement(App),
				new Proxy(
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
				),
				{
					// onError
					// context
					// identifierPrefix
					// signal
				},
			),
			{},
		),
);

export default router.buildHandler();
