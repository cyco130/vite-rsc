export type PageProps = {
	params: { [key: string]: string };
	searchParams: { [key: string]: string };
	children?: React.ReactNode;
	url: string;
	headers: { [key: string]: string };
};

type ModuleSpec = {};
type ModuleMap = { [key: string]: ModuleSpec };

declare module "react-server-dom-webpack/server.edge" {
	function renderToReadableStream(
		element: React.ReactElement,
		clientModuleMap: ModuleMap,
		options?: {
			onError?: (error: Error) => void;
			context?: any;
			identifierPrefix?: string;
			signal?: AbortSignal;
		},
	): ReadableStream;

	function decodeReply<T = any>(reply: string): Promise<T>;
}

declare module "react-server-dom-webpack/client.browser" {
	function createFromReadableStream(
		stream: ReadableStream,
		config?: {
			callServer: (...args: any[]) => void;
		},
	): React.Thenable<JSX.Element>;
	function createFromFetch(
		fetchResponse: Promise<Response>,
		config?: {
			callServer: (...args: any[]) => void;
		},
	): React.Thenable<JSX.Element>;
	function encodeReply(body: any): Promise<ReadableStream>;
}

declare module "react-server-dom-webpack/client.edge" {
	function createFromReadableStream(
		stream: ReadableStream,
		config?: {
			callServer: (...args: any[]) => void;
		},
	): React.Thenable<JSX.Element>;
	function createFromFetch(
		fetchResponse: Promise<Response>,
		config?: {
			callServer: (...args: any[]) => void;
		},
	): React.Thenable<JSX.Element>;
	function encodeReply(body: any): Promise<ReadableStream>;
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
