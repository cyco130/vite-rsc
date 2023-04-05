import { ElementType } from "react";
import { Context, RouteModule, DataModule } from "@impalajs/core";
import { BundleMap, renderToHTMLStream } from "rsc-router/streams";
import consumers from "node:stream/consumers";
import { join, relative } from "node:path";
import type { Manifest } from "vite";

declare global {
	function __webpack_require__(id: string): any;
	function __webpack_chunk_load__(id: string): any;
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

	const serverDist = join(process.cwd(), "dist/server");

	const clientManifest: { default: Manifest } = await import(
		"../dist/static/manifest.json"
	);

	const serverManifest: { default: Manifest } = await import(
		"../dist/server/manifest.json"
	);

	globalThis.__webpack_chunk_load__ = async (chunk: string) => {
		console.log("Loading chunk", chunk, serverManifest.default[chunk]?.file);
		return import(
			/* @vite-ignore */ join(
				serverDist,
				serverManifest.default[chunk]?.file ?? chunk,
			)
		);
	};

	globalThis.__webpack_require__ = async (chunk: string) => {
		console.log("Requiring chunk", chunk);
		return await import(
			/* @vite-ignore */ join(
				serverDist,
				serverManifest.default[chunk]?.file ?? chunk,
			)
		);
	};

	console.log(clientScriptName, clientManifest.default);

	// const bundleMap: BundleMap = (
	// 	await import(
	// 		// @ts-expect-error
	// 		"../../dist/server/client-bundle-map.json"
	// 	)
	// ).default;

	const clientScript =
		clientManifest.default[relative(process.cwd(), clientScriptName)].file ??
		clientScriptName;

	const { default: Page } = await mod();

	const htmlStream = await renderToHTMLStream(<Page {...context} />, {
		bootstrapModules: [clientScript],
		clientModuleMap: bundlerConfig,
	});

	const body = await consumers.text(htmlStream);

	return { body, head: {} };
}
