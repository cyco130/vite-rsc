import type { RenderToReadableStreamOptions } from "react-dom/server.edge";
import { renderToResultStream } from "./server-streams";
import type { Env } from "./env";

async function renderServerComponentDev<T extends any = any>(
	src: string,
	props: T,
	env: Env,
): Promise<ReadableStream> {
	const { default: devServer } = await import("virtual:vite-dev-server");
	return devServer.rscWorker.render(src, props, env);
}

async function renderServerComponentProd<T extends any = any>(
	src: string,
	props: T,
	env: Env,
): Promise<ReadableStream> {
	const path = await import("path");
	const rootDir = path.join(process.cwd(), process.env.OUT_ROOT_DIR ?? ".");
	const { default: entry } = await import(
		/* @vite-ignore */ path.join(
			rootDir,
			import.meta.env.REACT_SERVER_PROD_ENTRY,
		)
	);
	const stream = await entry(src, props, env);
	return stream;
}

export const renderServerComponent = import.meta.env.DEV
	? renderServerComponentDev
	: renderServerComponentProd;

export async function createServerComponentResponse(
	component: string,
	props: any,
	env: RenderToReadableStreamOptions & Env,
	responseInit: ResponseInit = {},
) {
	const serverElement = await renderServerComponent(component, props, env);

	return new Response(serverElement, {
		...responseInit,
		headers: {
			"Content-Type": "text/x-component",
			...(responseInit.headers ?? {}),
		},
	});
}

export async function createActionResponse(
	action: any,
	args: any,
	renderOptions: RenderToReadableStreamOptions & {
		clientModuleMap: ModuleMap;
	},
	responseInit: ResponseInit = {},
) {
	return new Response(
		renderToResultStream(await action(...args), renderOptions.clientModuleMap),
		{
			...responseInit,
			headers: {
				"Content-Type": "application/json",
				...(responseInit.headers ?? {}),
			},
		},
	);
}

export async function createMutationResponse(
	action: any,
	args: any,
	component: any,
	props: any,
	env: RenderToReadableStreamOptions & Env,
	responseInit: ResponseInit = {},
) {
	try {
		await action(...args);
		return new Response(await renderServerComponent(component, props, env), {
			...responseInit,
			headers: {
				"Content-Type": "text/x-component",
				...(responseInit.headers ?? {}),
			},
		});
	} catch (e: any) {
		console.log("error", e);
		return new Response(e.message, {
			...responseInit,
			status: 500,
			headers: {
				"Content-Type": "text/plain",
				...(responseInit.headers ?? {}),
			},
		});
	}
}
