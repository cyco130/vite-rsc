import { createRouter } from "@hattip/router";
import {
	renderToReadableStream as renderToFlightStream,
	decodeReply,
	renderToReadableStream,
} from "react-server-dom-webpack/server.edge";
import { createElement } from "react";
import devServer from "virtual:vite-dev-server";
import type { Manifest } from "vite";
import Root from "~/root?rsc";
import { renderToHTMLStream as renderToHTMLStream } from "./streams";
import path from "node:path";

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
			const [id, name] = String(prop).split("#", 2);
			return {
				id,
				chunks: [id],
				name,
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
	const pathname = context.url.pathname.slice("/__rsc".length);
	const appUrl = new URL(
		pathname + context.url.search,
		"http://localhost:3000",
	);
	return new Response(
		renderToFlightStream(
			createElement(Root, {
				url: appUrl.href,
				searchParams: Object.fromEntries(appUrl.searchParams.entries()),
				headers: Object.fromEntries(context.request.headers.entries()),
			}),
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
 * This is the single RSF endpoint. It is used to respond to server functions.
 */
router.post("/__rsf/*", async (context) => {
	const actionId = context.request.headers.get("x-action");
	if (!actionId) {
		return new Response("Not Found", { status: 404 });
	}

	const [filePath, name] = actionId.split("#");
	const serverFunction = (await import(/* @vite-ignore */ filePath))[name];
	const args = await decodeReply(await context.request.text());
	const result = await serverFunction(...args);

	return new Response(renderToReadableStream(result, bundlerConfig, {}), {
		headers: {
			"Content-Type": "application/json",
		},
	});
});

/**
 * This handles all the routes defined in the app. It renders HTML by first rendering
 * the RSC tree and then passing that to react-dom/server's streaming renderer.
 */
router.get("/*", async (context) => {
	let clientScript = path.join(
		"/@fs",
		process.cwd(),
		"/node_modules/@vite-rsc/router/src/entry-client.tsx",
	);

	if (!devServer) {
		const manifest: { default: Manifest } = await import(
			// @ts-expect-error: manifest.json is only available at build time
			"../../dist/client/manifest.json"
		);
		clientScript = manifest.default[clientScript.slice(1)].file ?? clientScript;
	}

	return new Response(
		await renderToHTMLStream(
			createElement(Root, {
				url: context.request.url,
				searchParams: Object.fromEntries(context.url.searchParams.entries()),
				headers: Object.fromEntries(context.request.headers.entries()),
			}),
			{
				bootstrapModules: [clientScript],
			},
		),
		{
			headers: { "Content-Type": "text/html" },
		},
	);
});

export default router.buildHandler();
