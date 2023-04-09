import { RenderToReadableStreamOptions } from "react-dom/server.edge";
import { renderToResultStream } from "./server-streams";
import { Env } from "./env";

function renderServerComponentDev(
	src: string,
	props: any,
	env: Env,
): ReadableStream {
	// @ts-ignore
	return __vite_dev_server__.rscServer.render(src, props, env);
}

function renderServerComponentProd(): ReadableStream {
	return null as any;
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
	const serverElement = renderServerComponent(component, props, env);

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
		return new Response(renderServerComponent(component, props, env), {
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
