import { createRouter, Router } from "@hattip/router";
import React from "react";
import { getURLFromRedirectError, isRedirectError } from "../shared/redirect";
import { requestAsyncContext } from "./async-storage";
import {
	createHTMLResponse,
	createServerComponentResponse as createServerComponentStreamResponse,
	createActionResponse,
	decodeServerFunctionArgs,
} from "./streams";
import { RenderToReadableStreamOptions } from "react-dom/server.edge";

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

	const action = (await __webpack_chunk_get__(filePath))[name];

	console.log(action);

	const isMutating = request.headers.get("x-mutation") === "1";

	// if it's a mutation, either plain action, or form, we return a RSC response
	// for the next page the user needs to visit, (could be the same page too)
	if (isMutating) {
		const responseInit: ResponseInit = {};
		return requestAsyncContext.run(
			{ request, response: responseInit },
			async () => {
				try {
					await action(...data);
					const url = new URL(request.url);
					return createServerComponentStreamResponse(
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
						return createServerComponentStreamResponse(
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
			},
		);
	} else if (isForm || isMultiPartForm) {
		try {
			await action(...data);
			const url = new URL(request.url);
			const responseInit: ResponseInit = {};
			return requestAsyncContext.run(
				{ request, response: responseInit },
				async () => {
					return createHTMLResponse(
						<Root
							url={url.href}
							searchParams={Object.fromEntries(url.searchParams.entries())}
							headers={Object.fromEntries(request.headers.entries())}
							params={{}}
						/>,
						{ clientModuleMap },
						responseInit,
					);
				},
			);
		} catch (e) {
			if (isRedirectError(e)) {
				return new Response("", {
					status: 302,
					headers: {
						Location: getURLFromRedirectError(e),
					},
				});
			}
		}
	}

	return createActionResponse(action, data, {
		clientModuleMap,
	});
}

export async function handlePageRequest(
	request: Request,
	RootComponent: React.ComponentType<any>,
	{
		clientModuleMap,
		...renderOptions
	}: {
		clientModuleMap: ModuleMap;
	} & RenderToReadableStreamOptions,
) {
	const url = new URL(request.url);
	const response: ResponseInit = {};
	return requestAsyncContext.run(
		{ request, response },
		async () =>
			await createHTMLResponse(
				<RootComponent
					url={request.url}
					searchParams={Object.fromEntries(url.searchParams.entries())}
					headers={Object.fromEntries(request.headers.entries())}
					params={{}}
				/>,
				{
					clientModuleMap,
					...renderOptions,
				},
				response,
			),
	);
}

export async function handleServerComponentRequest(
	request: Request,
	Root: any,
	{ clientModuleMap }: { clientModuleMap: any },
) {
	const url = new URL(request.headers.get("x-navigate") ?? "/", request.url);
	const response: ResponseInit = {};
	return requestAsyncContext.run({ request, response }, () =>
		createServerComponentStreamResponse(
			<Root
				url={url.href}
				searchParams={Object.fromEntries(url.searchParams.entries())}
				headers={Object.fromEntries(request.headers.entries())}
				params={{}}
			/>,
			{ clientModuleMap },
			response,
		),
	);
}

export function createServerRouter(
	Root: any,
	{
		clientModuleMap,
		apiRoutes: routeHandlers,
		...renderOptions
	}: {
		clientModuleMap: any;
		apiRoutes: (router: any) => void;
	} & RenderToReadableStreamOptions,
): Router {
	const router = createRouter();

	routeHandlers(router);

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
			return handleServerComponentRequest(context.request, Root, {
				clientModuleMap,
			});
		}

		return await handlePageRequest(context.request, Root, {
			...renderOptions,
			clientModuleMap,
		});
	});

	return router;
}
