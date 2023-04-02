declare module "react-server-dom-webpack/server.edge" {
	function renderToReadableStream(
		element: React.ReactElement,
		bundlerConfig: {},
		options?: {
			onError?: (error: Error) => void;
			context?: any;
			identifierPrefix?: string;
			signal?: AbortSignal;
		},
	): ReadableStream;
}

declare module "react-server-dom-webpack/client.browser" {
	function createFromReadableStream(
		stream: ReadableStream,
		config?: {
			callServer: (...args: any[]) => void;
		},
	): Promise<import("react").ReactNode>;
}

declare module "react-dom/server.edge" {
	export * from "react-dom/server";
}

declare module "*?rsc" {
	var component: React.ComponentType<any>;
	export default component;
}

declare module "virtual:vite-dev-server" {
	import type { ViteDevServer } from "vite";
	const viteDevServer: ViteDevServer;
	export default viteDevServer;
}