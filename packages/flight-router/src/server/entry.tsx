import { createModuleMapProxy, setupWebpackEnv } from "./webpack";
import { createServerRouter } from "./handler";
import Root from "~/root?rsc";
import { Router, RouterContext } from "@hattip/router";
export function createReactServerHandler({
	apiRoutes,
}: {
	apiRoutes?: (router: Router) => void;
} = {}) {
	return (context: RouterContext & { manifest: any }) => {
		setupWebpackEnv(async (load) => {
			const url =
				`./` +
				globalThis.serverManifest[load.slice(process.cwd().length + 1)].file;
			const mod = await import(/* @vite-ignore */ url);
			console.log(url, mod);
			return mod;
			return {};
		});

		const clientModuleMap = createModuleMapProxy();

		return createServerRouter(Root, {
			clientModuleMap,
			bootstrapScriptContent: import.meta.env.DEV
				? undefined
				: `window.manifest = ${JSON.stringify({
						manifest: globalThis.clientManifest,
						root: process.cwd(),
				  })};`,
			bootstrapModules: [
				import.meta.env.DEV
					? "~root/entry-client"
					: `/${globalThis.clientManifest["app/entry-client.tsx"].file}`,
			],
			apiRoutes: apiRoutes ?? (() => {}),
		}).buildHandler()(context);
	};
}
