import { IncomingMessage, ServerResponse } from "node:http";
import { createElement } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { App } from "./App";
import { renderToPipeableStream as renderToFlightStream } from "react-server-dom-webpack/server.node";
// @ts-expect-error
import Home from "./routes/Home?rsc";

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
	const path = (req.url ?? "/").split("?", 1)[0];

	if (path === "/__rsc" || path.startsWith("/__rsc")) {
		renderRsc(req, res);
		return;
	}

	res.setHeader("Content-Type", "text/html");
	const { pipe } = renderToPipeableStream(createElement(App, { path }), {
		bootstrapModules: ["/src/entry-client.tsx"],
	});

	pipe(res);
}

function renderRsc(req: IncomingMessage, res: ServerResponse) {
	res.setHeader("Content-Type", "text/x-component");
	const { pipe } = renderToFlightStream(
		createElement(Home),
		new Proxy(
			{},
			{
				get(_, prop) {
					const [id, name] = String(prop).split("#", 2);
					return {
						id,
						chunks: [id],
						name,
					};
				},
			},
		),
		{
			// onError
			// context
			// identifierPrefix
		},
	);
	pipe(res);
}
