import { createModuleMapProxy, setupWebpackEnv } from "./webpack";
import { createServerRouter } from "./handler";
import { Router } from "@hattip/router";

declare global {
	var serverManifest: { [key: string]: { file: string } };
	var clientManifest: { [key: string]: { file: string } };
}

import { basename, join, relative } from "node:path";
import { ModuleNode, Manifest } from "vite";
import { collectStyles } from "./dev/find-styles";
import { existsSync } from "node:fs";

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param manifest Client manifest
 * @param id Chunk id
 * @param assetMap Cache of assets
 * @returns Array of asset URLs
 */
export const findAssetsInManifest = (
	manifest: Manifest,
	id: string,
	assetMap: Map<string, Array<string>> = new Map(),
): Array<string> => {
	function traverse(id: string): Array<string> {
		const cached = assetMap.get(id);
		if (cached) {
			return cached;
		}
		const chunk = manifest[id];
		if (!chunk) {
			return [];
		}
		const assets = [
			...(chunk.assets || []),
			...(chunk.css || []),
			...(chunk.imports?.flatMap(traverse) || []),
		];
		const imports = chunk.imports?.flatMap(traverse) || [];
		const all = [...assets, ...imports].filter(
			Boolean as unknown as (a: string | undefined) => a is string,
		);
		all.push(chunk.file);
		assetMap.set(id, all);
		return Array.from(new Set(all));
	}
	return traverse(id);
};

export const findAssetsInModuleNode = (moduleNode: ModuleNode) => {
	const seen = new Set<string>();
	function traverse(node: ModuleNode): Array<string> {
		if (seen.has(node.url)) {
			return [];
		}
		seen.add(node.url);

		const imports = [...node.importedModules].flatMap(traverse) || [];
		imports.push(node.url);
		return Array.from(new Set(imports));
	}
	return traverse(moduleNode);
};

/**
 * Traverses the module graph and generates link tags to either import or preload asets
 */
export function renderLinkTagsForManifestChunk(
	manifest: Manifest,
	id: string,
	cachedAssetMap?: Map<string, Array<string>>,
): string {
	const assets = findAssetsInManifest(manifest, id, cachedAssetMap);
	return assets.map((asset) => renderLinkTag(`/${asset}`)).join("");
}

/**
 * Finds all the imported modules for a given module and generates link tags to
 * either import or preload them.
 */
const renderLinkTagsForModuleNode = (node: ModuleNode): string => {
	const assets = findAssetsInModuleNode(node);
	return assets.map(renderLinkTag).join("");
};

function renderAssetLinkTags(assets: Array<string>): string {
	return assets.map((asset) => renderLinkTag(`/${asset}`)).join("");
}

interface LinkProps {
	rel: string;
	as?: string;
	type?: string;
	crossorigin?: string;
}

const linkPropsMap: Map<string, LinkProps> = new Map([
	["js", { rel: "modulepreload", crossorigin: "true" }],
	["jsx", { rel: "modulepreload", crossorigin: "true" }],
	["ts", { rel: "modulepreload", crossorigin: "true" }],
	["tsx", { rel: "modulepreload", crossorigin: "true" }],
	["css", { rel: "stylesheet" }],
	[
		"woff",
		{ rel: "preload", as: "font", type: "font/woff", crossorigin: "true" },
	],
	[
		"woff2",
		{ rel: "preload", as: "font", type: "font/woff2", crossorigin: "true" },
	],
	["gif", { rel: "preload", as: "image", type: "image/gif" }],
	["jpg", { rel: "preload", as: "image", type: "image/jpeg" }],
	["jpeg", { rel: "preload", as: "image", type: "image/jpeg" }],
	["png", { rel: "preload", as: "image", type: "image/png" }],
	["webp", { rel: "preload", as: "image", type: "image/webp" }],
	["svg", { rel: "preload", as: "image", type: "image/svg+xml" }],
	["ico", { rel: "preload", as: "image", type: "image/x-icon" }],
	["avif", { rel: "preload", as: "image", type: "image/avif" }],
	["mp4", { rel: "preload", as: "video", type: "video/mp4" }],
	["webm", { rel: "preload", as: "video", type: "video/webm" }],
]);

/**
 * Generates a link tag for a given file. This will load stylesheets and preload
 * everything else. It uses the file extension to determine the type.
 */

export function renderLinkTag(file: string) {
	const ext = basename(file).split(".").pop();
	if (!ext) {
		return "";
	}
	const props = linkPropsMap.get(ext);
	if (!props) {
		return "";
	}
	const attrs = Object.entries(props)
		.map(([key, value]) => `${key}="${value}"`)
		.join(" ");
	return `<link href="${file}" ${attrs} />`;
}

export function createHandler(
	Root: any,
	{
		apiRoutes,
	}: {
		apiRoutes?: (router: Router) => void;
	} = {},
) {
	setupWebpackEnv(async (chunk) => {
		if (import.meta.env.PROD) {
			console.log(chunk);
			const url = join(
				process.cwd(),
				"dist",
				"server",
				globalThis.serverManifest[relative(process.cwd(), chunk)].file,
			);
			console.log(relative(process.cwd(), chunk), url);
			const mod = await import(/* @vite-ignore */ url);
			return mod;
		} else {
			return await import(/* @vite-ignore */ chunk);
		}
	});

	const clientModuleMap = createModuleMapProxy();

	if (import.meta.env.DEV) {
		globalThis.findAssets = async () => {
			const { default: devServer } = await import("virtual:vite-dev-server");
			const styles = await collectStyles(devServer, ["~/root?rsc"]);
			return [
				// @ts-ignore
				...Object.entries(styles ?? {}).map(([key, value]) => ({
					type: "style" as const,
					style: value,
					src: key,
				})),
			];
		};
	} else {
		globalThis.findAssets = async () => {
			const findAssets = (chunk: string) => {
				return findAssetsInManifest(serverManifest, chunk)
					.filter((asset) => !asset.endsWith(".js"))
					.map((asset) => `/${asset}`);
			};

			return [...findAssets("app/root.tsx")];
		};
	}

	console.log(relative(process.cwd(), import.meta.env.CLIENT_ENTRY));
	// const assetMap = new Map<string, Array<string>>();
	// const assets = findAssetsInManifest(serverManifest, "app/root.tsx", assetMap);
	return createServerRouter(Root, {
		clientModuleMap,
		bootstrapScriptContent: import.meta.env.DEV
			? undefined
			: `window.manifest = ${JSON.stringify({
					root: process.cwd(),
					client: Object.fromEntries(
						Object.entries(clientManifest)
							.filter(([key, asset]) => asset.file)
							.map(([key, asset]) => [key, asset.file]),
					),
			  })};`,
		bootstrapModules: [
			import.meta.env.DEV
				? import.meta.env.CLIENT_ENTRY
				: `/${
						globalThis.clientManifest[
							relative(import.meta.env.ROOT_DIR, import.meta.env.CLIENT_ENTRY)
						].file
				  }`,
		],
		apiRoutes: apiRoutes ?? (() => {}),
	}).buildHandler();
}
