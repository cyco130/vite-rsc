import { createRouter, Router } from "@hattip/router";
import React from "react";
import { asyncLocalStorage } from "./async-storage";
import {
	createHTMLStreamResponse,
	createRSCStreamResponse,
	createActionStreamResponse,
	createMutationStreamResponse,
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

	const isMutating = request.headers.get("x-mutation") === "1";

	if (isMutating) {
		const url = new URL(request.url);
		const encodedArgs = await request.text();

		return asyncLocalStorage.run({ request }, async () => {
			return createMutationStreamResponse(
				action,
				encodedArgs,
				<Root
					url={url.href}
					searchParams={Object.fromEntries(url.searchParams.entries())}
					headers={Object.fromEntries(request.headers.entries())}
					params={{}}
				/>,
				{ clientModuleMap },
			);
		});
	}

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

	return asyncLocalStorage.run(
		{ request },
		async () =>
			await createHTMLStreamResponse(
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
			),
	);
}

export async function handleRSCRequest(
	request: Request,
	Root: any,
	{ clientModuleMap }: { clientModuleMap: any },
) {
	const url = new URL(request.headers.get("x-navigate") ?? "/", request.url);
	return asyncLocalStorage.run({ request }, () =>
		createRSCStreamResponse(
			<Root
				url={url.href}
				searchParams={Object.fromEntries(url.searchParams.entries())}
				headers={Object.fromEntries(request.headers.entries())}
				params={{}}
			/>,
			{ clientModuleMap },
		),
	);
}

type Handler = (context: { request: Request }) => Response | Promise<Response>;

export function createServerRouter(
	Root: any,
	{
		clientModuleMap,
		clientEntry,
		apiRoutes,
	}: {
		clientModuleMap: any;
		clientEntry: string;
		apiRoutes: (router: any) => void;
	},
): Router {
	const router = createRouter();

	apiRoutes(router);

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
		if (context.request.headers.get("accept") === "text/x-component") {
			return handleRSCRequest(context.request, Root, { clientModuleMap });
		}

		return await handlePageRequest(context.request, Root, {
			clientEntry,
			clientModuleMap,
		});
	});

	return router;
}
