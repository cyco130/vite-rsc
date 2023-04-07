import { basename } from "node:path";
import { ModuleNode, Manifest } from "vite";

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

		const imports = [...node.importedModules].flatMap(traverse) || [];
		imports.push(node.url);
		seen.add(node.url);
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
export const renderLinkTagsForModuleNode = (node: ModuleNode): string => {
	const assets = findAssetsInModuleNode(node);
	return assets.map(renderLinkTag).join("");
};

export function renderAssetLinkTags(assets: Array<string>): string {
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
