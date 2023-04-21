import sirv, { Options, RequestHandler } from "sirv";

import { HattipHandler } from "@hattip/core";
import { createMiddleware } from "@hattip/adapter-node";
import { createServer } from "node:http";

let handleExports: {
	default: HattipHandler;
	sirvOptions?: Options;
};

let sirvHandler: RequestHandler;

async function init() {
	// @ts-expect-error: This is a virtual module
	// eslint-disable-next-line import/no-unresolved
	handleExports = await import("/virtual:vavite-connect-handler");

	const middleware = createMiddleware(handleExports.default);

	sirvHandler = sirv(
		// @ts-expect-error: This will be defined by the plugin
		CLIENT_BUILD_OUTPUT_DIR,
		handleExports.sirvOptions,
	);

	const PORT = Number(process.env.PORT) || 3000;
	const HOST = process.env.HOST || "localhost";

	createServer((req, res) =>
		sirvHandler(req, res, () => {
			middleware(req, res, () => {
				if (!res.writableEnded) {
					res.statusCode = 404;
					res.end();
				}
			});
		}),
	).listen(PORT, HOST, () => {
		// eslint-disable-next-line no-console
		console.log(`Server listening on http://${HOST}:${PORT}`);
	});
}

init();
