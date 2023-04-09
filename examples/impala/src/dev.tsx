import type { ElementType } from "react";
import { Context, RouteModule } from "@impalajs/core";
import { renderToHTMLStream } from "stream-react/server";
import { createModuleMapProxy, setupWebpackEnv } from "stream-react/webpack";
import consumers from "node:stream/consumers";
import { collectStyles } from "stream-react/dev";

export async function renderDev(
	context: Context,
	mod: () => Promise<RouteModule<ElementType>>,
) {
	setupWebpackEnv();
	const clientModuleMap = createModuleMapProxy();

	context.assets = Array.from(new Set(context.assets)).map(
		(asset) => `/${asset}`,
	);

	const { default: devServer } = await import("virtual:vite-dev-server");

	const { default: Page } = await mod();

	let styles = await collectStyles(devServer, [
		context.chunk.replace("./", "src/") + "?rsc",
	]);

	context.assets.push(
		// @ts-ignore
		...Object.entries(styles ?? {}).map(([key, value]) => ({
			type: "style",
			style: value,
		})),
	);

	const htmlStream = await renderToHTMLStream(<Page {...context} />, {
		bootstrapModules: ["/src/entry-client.tsx"],
		clientModuleMap,
	});

	const body = await consumers.text(htmlStream);

	return { body, head: "" };
}
