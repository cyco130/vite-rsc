import { ElementType } from "react";
import { Context, RouteModule, DataModule } from "@impalajs/core";
import { BundleMap, renderToHTMLStream } from "@vite-rsc/router/streams";
import consumers from "node:stream/consumers";
import { join } from "node:path";
import type { Manifest } from "vite";

declare global {
	function __webpack_require__(id: string): any;
}
export const routeModules = import.meta.glob<RouteModule>(
	"./routes/**/*.{tsx,jsx}",
	{
		query: { rsc: "" },
	},
);

export const dataModules = import.meta.glob<DataModule>(
	"./routes/**/*.data.{ts,js}",
	{
		query: { rsc: "" },
	},
);

globalThis.__webpack_require__ = async (chunk: string) => {
	console.log("Requiring chunk", chunk);
	return import(/* @vite-ignore */ chunk);
};

export const bundlerConfig: BundleMap = new Proxy(
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

export async function render(
	context: Context,
	mod: () => Promise<RouteModule<ElementType>>,
	// bootstrapModules?: Array<string>,
) {
	const clientScriptName = join(process.cwd(), "src/entry-client.tsx");

	const manifest: { default: Manifest } = await import(
		"../dist/static/manifest.json"
	);

	console.log(clientScriptName, manifest.default);

	// const bundleMap: BundleMap = (
	// 	await import(
	// 		// @ts-expect-error
	// 		"../../dist/server/client-bundle-map.json"
	// 	)
	// ).default;

	const clientScript =
		manifest.default[clientScriptName.slice(1)].file ?? clientScriptName;

	const { default: Page } = await mod();

	const htmlStream = await renderToHTMLStream(
		<Page {...context} />,
		bundleMap,
		{
			bootstrapModules: [clientScript],
		},
	);

	const body = await consumers.text(htmlStream);

	return { body, head: {} };
}
