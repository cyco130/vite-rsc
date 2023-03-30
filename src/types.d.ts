declare module "react-server-dom-webpack/server.edge";
declare module "react-server-dom-webpack/client.browser";

declare module "react-dom/server.edge" {
	export * from "react-dom/server";
}

declare module "virtual:vite-dev-server" {
	import type { ViteDevServer } from "vite";
	const viteDevServer: ViteDevServer;
	export default viteDevServer;
}
