import { createRouter } from "@hattip/router";
import { renderToReadableStream as renderToFlightStream } from "react-server-dom-webpack/server.edge";
import { createElement } from "react";
import devServer from "virtual:vite-dev-server";
import type { Manifest } from "vite";
import Root from "../../app/root?rsc";
import { renderToHTMLStream as renderToHTMLStream } from "./streams";

const router = createRouter();

declare global {
	var moduleCache: Map<string, any>;
	function __webpack_chunk_load__(chunk: string): Promise<void>;
	function __webpack_require__(id: string): any;
}

/**
 * This is a hack to make vite dev server work with react-server-dom-webpack.
 * The cache is persisted between HMR updates on the server.
 */
globalThis.moduleCache = globalThis.moduleCache ?? new Map<string, any>();

globalThis.__webpack_chunk_load__ = async (chunk: string) => {
	globalThis.moduleCache.set(chunk, await import(/* @vite-ignore */ chunk));
};

globalThis.__webpack_require__ = (id: string) => {
	if (!globalThis.moduleCache.has(id))
		throw new Error(`Module ${id} not found`);
	return globalThis.moduleCache.get(id);
};

/**
 * This is another hack to make vite dev server work with react-server-dom-webpack.
 * We use a proxy during dev in order to make the bundler config look like the one that
 * react-server-dom-webpack expects at build time.
 */
export const bundlerConfig = new Proxy(
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

/**
 * This is the single RSC endpoint. It is used to render the required RSC tree for
 * navigations.
 */
router.get("/__rsc/*", async (context) => {
	// get the original url that the user requested
	let pathname = context.url.pathname.slice("/__rsc".length);
	let appUrl = new URL(pathname + context.url.search, "http://localhost:3000");
	return new Response(
		renderToFlightStream(
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

/**
 * This handles all the routes defined in the app. It renders HTML by first rendering
 * the RSC tree and then passing that to react-dom/server's streaming renderer.
 */
router.get("/*", async (context) => {
	let clientScript = "/modules/render/client.tsx";

	if (!devServer) {
		const manifest: { default: Manifest } = await import(
			// @ts-expect-error: manifest.json is only available at build time
			"../../dist/client/manifest.json"
		);
		clientScript = manifest.default[clientScript.slice(1)].file ?? clientScript;
	}

	return new Response(
		await renderToHTMLStream(createElement(Root, context), {
			bootstrapModules: [clientScript],
		}),
		{
			headers: { "Content-Type": "text/html" },
		},
	);
});

export default router.buildHandler();
