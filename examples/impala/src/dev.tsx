import type { ElementType } from "react";
import { Context, RouteModule } from "@impalajs/core";
import { ModuleMap, renderToHTMLStream } from "flight-router/streams";
import { createModuleMapProxy, setupWebpackEnv } from "flight-router/webpack";
import consumers from "node:stream/consumers";

export async function renderDev(
	context: Context,
	mod: () => Promise<RouteModule<ElementType>>,
	bootstrapModules: Array<string> = [],
) {
	setupWebpackEnv();
	const clientModuleMap: ModuleMap = createModuleMapProxy();

	context.assets = Array.from(new Set(context.assets)).map(
		(asset) => `/${asset}`,
	);

	const { default: Page } = await mod();

	const htmlStream = await renderToHTMLStream(<Page {...context} />, {
		bootstrapModules: [...bootstrapModules, "/src/entry-client.tsx"],
		bootstrapScriptContent: `window.___CONTEXT=${JSON.stringify(context)};`,
		clientModuleMap,
	});

	const body = await consumers.text(htmlStream);

	return { body, head: "" };
}
