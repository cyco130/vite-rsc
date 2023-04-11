import { createServer } from "node:http";
import sirv, { RequestHandler, Options } from "sirv";
import fs from "node:fs";

let handleExports: {
	default: RequestHandler;
	sirvOptions?: Options;
};

globalThis.clientManifest = JSON.parse(
	fs.readFileSync(`./dist/static/manifest.json`, "utf-8"),
);

globalThis.serverManifest = JSON.parse(
	fs.readFileSync(`./dist/server/manifest.json`, "utf-8"),
);

globalThis.reactServerManifest = JSON.parse(
	fs.readFileSync(`./dist/server/react-server/manifest.json`, "utf-8"),
);

let sirvHandler: RequestHandler;

async function init() {
	// @ts-expect-error: This is a virtual module
	// eslint-disable-next-line import/no-unresolved
	handleExports = await import("/virtual:vavite-connect-handler");

	sirvHandler = sirv(
		// @ts-expect-error: This will be defined by the plugin
		__VAVITE_CLIENT_BUILD_OUTPUT_DIR,
		handleExports.sirvOptions,
	);

	const PORT = Number(process.env.PORT) || 3000;
	const HOST = process.env.HOST || "localhost";

	createServer((req, res) =>
		sirvHandler(req, res, () => {
			handleExports.default(req, res, () => {
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
