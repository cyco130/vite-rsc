import { ElementType } from "react";
import { Context, RouteModule, DataModule } from "@impalajs/core";
import { ModuleMap, renderToHTMLStream } from "flight-router/streams";
import consumers from "node:stream/consumers";
import { join, relative } from "node:path";
import type { Manifest } from "vite";
import { promises as fs, existsSync } from "node:fs";
import { renderDev } from "./dev";
import { createModuleMapProxy, setupWebpackEnv } from "flight-router/webpack";
import { findAssetsInManifest } from "./manifest";

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

	setupWebpackEnv((chunk: string) => {
		let filePath = join(
			serverDist,
			serverManifest[relative(process.cwd(), chunk)]?.file,
		);
		return import(/* @vite-ignore */ filePath);
	});

	const clientModuleMap = createModuleMapProxy();

	const { default: Page } = await mod();

	context.assets = findAssetsInManifest(
		serverManifest,
		context.chunk.replace("./", "src/"),
	)
		.filter((asset) => !asset.endsWith(".js"))
		.map((asset) => `/${asset}`);

	context.root = process.cwd();
	context.manifest = clientManifest;

	const htmlStream = await renderToHTMLStream(<Page {...context} />, {
		bootstrapModules: [
			...bootstrapModules,
			`/${clientManifest["src/entry-client.tsx"].file}`,
		],
		bootstrapScriptContent: `window.___CONTEXT=${JSON.stringify(context)};`,
		clientModuleMap,
	});

	const body = await consumers.text(htmlStream);

	return { body, head: "" };
}
