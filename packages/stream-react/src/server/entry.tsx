import { createModuleMapProxy, setupWebpackEnv } from "./webpack";
import { createServerRouter } from "./handler";
import { Router } from "@hattip/router";

declare global {
	var serverManifest: any;
	var clientManifest: any;
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
			const url =
				`./` +
				globalThis.serverManifest[chunk.slice(process.cwd().length + 1)].file;
			const mod = await import(/* @vite-ignore */ url);
			return mod;
		} else {
			return await import(/* @vite-ignore */ chunk);
		}
	});

	const clientModuleMap = createModuleMapProxy();

	return createServerRouter(Root, {
		clientModuleMap,
		bootstrapScriptContent: import.meta.env.DEV
			? undefined
			: `window.__rsc__ = ${JSON.stringify({
					manifest: globalThis.clientManifest,
					root: process.cwd(),
			  })};`,
		bootstrapModules: [
			import.meta.env.DEV
				? "/app/entry-client"
				: `/${globalThis.clientManifest["app/entry-client.tsx"].file}`,
		],
		apiRoutes: apiRoutes ?? (() => {}),
	}).buildHandler();
}
