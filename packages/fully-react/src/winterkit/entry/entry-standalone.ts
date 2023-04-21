import { createServer } from "node:http";
import fs from "node:fs";
// @ts-expect-error: This is a virtual module
// eslint-disable-next-line import/no-unresolved
import handler from "/virtual:vavite-connect-handler";

globalThis.clientManifest = JSON.parse(
	fs.readFileSync(`./dist/static/manifest.json`, "utf-8"),
);

globalThis.serverManifest = JSON.parse(
	fs.readFileSync(`./dist/server/manifest.json`, "utf-8"),
);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";

createServer((req, res) =>
	handler(req, res, () => {
		if (!res.writableEnded) {
			res.statusCode = 404;
			res.end();
		}
	}),
).listen(PORT, HOST, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://${HOST}:${PORT}`);
});
