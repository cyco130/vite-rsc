import { ElementType } from "react";
import { Context, RouteModule } from "@impalajs/core";
import { BundleMap, renderToHTMLStream } from "rsc-router/streams";
import consumers from "node:stream/consumers";

const bundlerConfig: BundleMap = new Proxy(
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
export async function renderDev(
	context: Context,
	mod: () => Promise<RouteModule<ElementType>>,
	bootstrapModules: Array<string> = [],
) {
	context.assets = Array.from(new Set(context.assets)).map(
		(asset) => `/${asset}`,
	);

	globalThis.__webpack_chunk_load__ = async (chunk: string) => {
		console.log("Loading chunk", chunk);
		globalThis.moduleCache.set(chunk, await import(/* @vite-ignore */ chunk));
	};

	const { default: Page } = await mod();
	const htmlStream = await renderToHTMLStream(<Page {...context} />, {
		bootstrapModules: [...bootstrapModules, "src/entry-client.tsx"],
		bootstrapScriptContent: `window.___CONTEXT=${JSON.stringify(context)};`,
		clientModuleMap: bundlerConfig,
	});

	const body = await consumers.text(htmlStream);

	return { body, head: "" };
}
