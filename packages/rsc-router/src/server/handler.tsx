import { createRouter } from "@hattip/router";
import React from "react";
import {
	createHTMLStreamResponse,
	createRSCStreamResponse,
	createActionStreamResponse,
} from "./streams";

export async function handleActionRequest(
	request: Request,
	Root: any,
	{ clientModuleMap }: { clientModuleMap: ModuleMap },
) {
	const actionId = request.headers.get("x-action");
	if (!actionId) {
		return new Response("Not Found", { status: 404 });
	}

	const [filePath, name] = actionId.split("#");
	const action = (await import(/* @vite-ignore */ filePath))[name];

	return createActionStreamResponse(action, await request.text(), {
		clientModuleMap,
	});
}

export async function handlePageRequest(
	request: Request,
	RootComponent: React.ComponentType<any>,
	{
		clientModuleMap,
		clientEntry,
	}: {
		clientModuleMap: ModuleMap;
		clientEntry: string;
	},
) {
	const url = new URL(request.url);

	return createHTMLStreamResponse(
		<RootComponent
			url={request.url}
			searchParams={Object.fromEntries(url.searchParams.entries())}
			headers={Object.fromEntries(request.headers.entries())}
			params={{}}
		/>,
		{
			clientModuleMap,
			bootstrapModules: [clientEntry],
		},
	);
}

export async function handleRSCRequest(
	request: Request,
	Root: any,
	{ clientModuleMap }: { clientModuleMap: any },
) {
	const url = new URL(request.headers.get("x-navigate") ?? "/", request.url);
	return createRSCStreamResponse(
		<Root
			url={url.href}
			searchParams={Object.fromEntries(url.searchParams.entries())}
			headers={Object.fromEntries(request.headers.entries())}
			params={{}}
		/>,
		{ clientModuleMap },
	);
}

export function createHandler(
	Root: any,
	{
		clientModuleMap,
		clientEntry,
	}: { clientModuleMap: any; clientEntry: string },
) {
	const router = createRouter();

	/**
	 * This is the single RSC endpoint. It is used to render the required RSC tree for
	 * navigations.
	 */
	router.get("/__rsc/*", async (context) => {
		return handleRSCRequest(context.request, Root, { clientModuleMap });
	});

	/**
	 * This is the single RSF endpoint. It is used to respond to server functions.
	 */
	router.post("/*", async (context) => {
		return handleActionRequest(context.request, Root, { clientModuleMap });
	});

	/**
	 * This handles all the routes defined in the app. It renders HTML by first rendering
	 * the RSC tree and then passing that to react-dom/server's streaming renderer.
	 */
	router.get("/*", async (context) => {
		return await handlePageRequest(context.request, Root, {
			clientEntry,
			clientModuleMap,
		});
	});

	return router.buildHandler();
}
