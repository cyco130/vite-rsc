import { ElementType } from "react";
import { Context, RouteModule, DataModule } from "@impalajs/core";
import { BundleMap, renderToHTMLStream } from "rsc-router/streams";
import consumers from "node:stream/consumers";
import { join, relative } from "node:path";
import type { Manifest } from "vite";
import { promises as fs, existsSync } from "node:fs";
import { renderDev } from "./dev";

declare global {
	var moduleCache: Map<string, any>;
	function __webpack_require__(id: string): any;
	function __webpack_chunk_load__(id: string): any;
}

// Load the route modules as RSC and export for impala
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

globalThis.__webpack_require__ = (id: string) => {
	if (!globalThis.moduleCache.has(id))
		throw new Error(`Module ${id} not found`);
	return globalThis.moduleCache.get(id);
};

globalThis.moduleCache = globalThis.moduleCache ?? new Map<string, any>();

export async function render(
	context: Context,
	mod: () => Promise<RouteModule<ElementType>>,
	bootstrapModules: Array<string> = [],
) {
	if (import.meta.env.DEV) {
		return renderDev(context, mod, bootstrapModules);
	}

	const clientManifestPath = join(
		process.cwd(),
		"dist",
		"static",
		"manifest.json",
	);

	context.assets = Array.from(new Set(context.assets)).map(
		(asset) => `/${asset}`,
	);

	if (!existsSync(clientManifestPath)) {
		throw new Error("Client manifest not found. Did you do a client build?");
	}

	const clientManifest: Manifest = JSON.parse(
		await fs.readFile(clientManifestPath, "utf-8"),
	);

	const serverDist = join(process.cwd(), "dist", "server");
	const serverManifestPath = join(serverDist, "manifest.json");

	if (!existsSync(serverManifestPath)) {
		throw new Error("Server manifest not found. Did you do an SSR build?");
	}

	const serverManifest: Manifest = JSON.parse(
		await fs.readFile(serverManifestPath, "utf-8"),
	);

	globalThis.__webpack_chunk_load__ = async (chunk: string) => {
		console.log("Loading chunk", chunk);
		globalThis.moduleCache.set(
			chunk,
			await import(
				join(serverDist, serverManifest[relative(process.cwd(), chunk)]?.file)
			),
		);
	};

	const { default: Page } = await mod();
	const htmlStream = await renderToHTMLStream(<Page {...context} />, {
		bootstrapModules: [
			...bootstrapModules,
			`/${clientManifest["src/entry-client.tsx"].file}`,
		],
		bootstrapScriptContent: `window.___CONTEXT=${JSON.stringify(context)};`,
		clientModuleMap: bundlerConfig,
	});

	const body = await consumers.text(htmlStream);

	return { body, head: "" };
}
