import { Router, createRouter } from "@hattip/router";
import {
	createActionResponse,
	createServerComponentResponse,
	decodeServerFunctionArgs,
} from "./streams";
import { getURLFromRedirectError, isRedirectError } from "../shared/redirect";

import { Env } from "../env";
import { createHTMLResponse } from "./html";
import { requestAsyncContext } from "./async-context";

export async function handleActionRequest(request: Request, env: Env) {
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

	const action = (await env.loadModule(filePath))[name];

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
					return createServerComponentResponse(
						"root",
						{
							url: url.href,
							searchParams: Object.fromEntries(url.searchParams.entries()),
							headers: Object.fromEntries(request.headers.entries()),
							params: {},
						},
						env,
					);
				} catch (e) {
					console.error(e);
					if (isRedirectError(e)) {
						const redirectPath = getURLFromRedirectError(e);
						const url = new URL(redirectPath, request.url);
						return createServerComponentResponse(
							"root",
							{
								url: url.href,
								searchParams: Object.fromEntries(url.searchParams.entries()),
								headers: Object.fromEntries(request.headers.entries()),
								params: {},
							},
							env,
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
						"root",
						{
							url: url.href,
							searchParams: Object.fromEntries(url.searchParams.entries()),
							headers: Object.fromEntries(request.headers.entries()),
							params: {},
						},
						env,
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

	return createActionResponse(action, data, env);
}

export async function handlePageRequest(request: Request, env: Env) {
	const url = new URL(request.url);
	const responseInit: ResponseInit = {};
	const response = await requestAsyncContext.run(
		{ request, response: responseInit },
		async () =>
			await createHTMLResponse(
				"root",
				{
					url: request.url,
					searchParams: Object.fromEntries(url.searchParams.entries()),
					headers: Object.fromEntries(request.headers.entries()),
					params: {},
				},
				env,
				responseInit,
			),
	);

	console.log("response", response.status, response.url);
	return response;
}

export async function handleServerComponentRequest(request: Request, env: Env) {
	const cleanedUrl = request.url.replace(/\.rsc$/, "");
	const url = new URL(request.headers.get("x-navigate") ?? "/", cleanedUrl);
	const response: ResponseInit = {};
	return requestAsyncContext.run({ request, response }, () =>
		createServerComponentResponse(
			"root",
			{
				url: cleanedUrl,
				searchParams: Object.fromEntries(url.searchParams.entries()),
				headers: Object.fromEntries(request.headers.entries()),
				params: {},
			},
			env,
			response,
		),
	);
}

export function createServerRouter(env: Env): Router {
	const router = createRouter();

	Object.entries(env.routesConfig).forEach(([entry, route]) => {
		if (route.routeHandler) {
			router.get(route.path, async (context) => {
				const mod = await env.loadModule(route.file);

				const handler = mod[context.request.method];
				return await handler(context.request);
			});

			router.post(route.path, async (context) => {
				const mod = await env.loadModule(route.file);

				const handler = mod[context.request.method];
				return await handler(context.request);
			});
		}
	});

	// env.routeHandlers?.(router);

	/**
	 * This is the single RSF endpoint. It is used to respond to server functions.
	 */
	router.post("/*", async (context) => {
		return handleActionRequest(context.request, env);
	});

	/**
	 * This handles all the routes defined in the app. It renders HTML by first rendering
	 * the RSC tree and then passing that to react-dom/server's streaming renderer.
	 */
	router.get("/*", async (context) => {
		if (context.request.headers.get("accept") === "text/x-component") {
			return handleServerComponentRequest(context.request, env);
		}

		return await handlePageRequest(context.request, env);
	});

	return router;
}
