import React, { startTransition } from "react";
import { hydrateRoot, HydrationOptions } from "react-dom/client";
import { setupWebpackEnv } from "../client/webpack";
import { initMutation } from "../client/mutation";

export * from "./root";
export * from "./base-router";

export function loadModule(id: string) {
	if (import.meta.env.PROD) {
		const assetPath =
			`/` +
			globalThis.__rsc__.manifest[id.slice(globalThis.__rsc__.root.length + 1)]
				.file;
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
	startTransition(() => {
		hydrateRoot(document, element, hydrationOptions);
	});
}
