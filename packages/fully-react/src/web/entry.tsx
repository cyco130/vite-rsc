import React, { startTransition } from "react";
import { createRoot, hydrateRoot, HydrationOptions } from "react-dom/client";
import { setupWebpackEnv } from "./webpack";
import { initMutation } from "../client/mutation";

export * from "./root";

function pathRelative(from: string, to: string) {
	const fromParts = from.split("/").filter(Boolean);
	const toParts = to.split("/").filter(Boolean);

	let commonLength = 0;
	for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
		if (fromParts[i] === toParts[i]) {
			commonLength = i + 1;
		} else {
			break;
		}
	}

	const upLevel = fromParts.length - commonLength;
	let relativePath = "";

	for (let i = 0; i < upLevel; i++) {
		relativePath += "../";
	}

	for (let i = commonLength; i < toParts.length; i++) {
		relativePath += toParts[i] + (i < toParts.length - 1 ? "/" : "");
	}

	return relativePath || "./";
}

export function loadModule(id: string) {
	if (import.meta.env.PROD) {
		const assetPath =
			`/` +
			globalThis.manifest.client[pathRelative(import.meta.env.ROOT_DIR, id)];
		return import(/* @vite-ignore */ assetPath);
	} else {
		return import(/* @vite-ignore */ id);
	}
}

export function mount(
	element: JSX.Element,
	{
		loadModule: _loadModule,
		...hydrationOptions
	}: {
		loadModule?: (chunk: string) => Promise<any>;
	} & Partial<HydrationOptions> = {
		loadModule,
	},
) {
	setupWebpackEnv(_loadModule);
	initMutation();
	if (window.document.documentElement.id === "__error__") {
		createRoot(document as unknown as HTMLElement).render(element);
	} else {
		startTransition(() => {
			hydrateRoot(document, element, hydrationOptions);
		});
	}
}
