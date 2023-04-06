import { createRouter, Router } from "@hattip/router";
import React from "react";
import { getURLFromRedirectError, isRedirectError } from "../client";
import { asyncLocalStorage } from "./async-storage";
import {
	createHTMLStreamResponse,
	createRSCStreamResponse,
	createActionStreamResponse,
	createMutationStreamResponse,
	decodeServerFunctionArgs,
} from "./streams";

export async function handleActionRequest(
	request: Request,
	Root: any,
	{ clientModuleMap }: { clientModuleMap: ModuleMap },
) {
	let actionId = request.headers.get("x-action")!;
	const isAction = !!actionId;
	const isForm =
		request.headers.get("content-type") === "application/x-www-form-urlencoded";
	const isMultiPartForm = request.headers
		.get("content-type")
		?.startsWith("multipart/form-data");

	if (!isAction && !isForm && !isMultiPartForm) {
		return new Response("Not Found", { status: 404 });
	}

	let data: any;
	if (isForm || isMultiPartForm) {
		const formData = await request.formData();
		data = [formData];
		actionId = formData.get("$$id") as string;
	} else {
		const encodedArgs = await request.text();
		data = await decodeServerFunctionArgs(encodedArgs);
	}

	const [filePath, name] = actionId.split("#");
	const action = (await import(/* @vite-ignore */ filePath))[name];

	const isMutating = request.headers.get("x-mutation") === "1";

	// if it's a mutation, either plain action, or form, we return a RSC response
	// for the next page the user needs to visit, (could be the same page too)
	if (isMutating) {
		return asyncLocalStorage.run({ request }, async () => {
			try {
				await action(...data);
				const url = new URL(request.url);
				return createRSCStreamResponse(
					<Root
						url={url.href}
						searchParams={Object.fromEntries(url.searchParams.entries())}
						headers={Object.fromEntries(request.headers.entries())}
						params={{}}
					/>,
					{ clientModuleMap },
				);
			} catch (e) {
				if (isRedirectError(e)) {
					const redirectPath = getURLFromRedirectError(e);
					const url = new URL(redirectPath, request.url);
					return createRSCStreamResponse(
						<Root
							url={url.href}
							searchParams={Object.fromEntries(url.searchParams.entries())}
							headers={Object.fromEntries(request.headers.entries())}
							params={{}}
						/>,
						{ clientModuleMap },
						{
							status: 200,
							headers: {
								"x-redirect": redirectPath,
							},
						},
					);
				}
			}
		});
	} else if (isForm) {
		const url = new URL(request.url);

		return asyncLocalStorage.run({ request }, async () => {
			return createHTMLStreamResponse(
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

	return createActionStreamResponse(action, data, {
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
