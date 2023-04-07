import { createMiddleware } from "@hattip/adapter-node";
import hattipHandler from "./dist/server/entry-server.js";
import serverManifest from "./dist/server/manifest.json" assert { type: "json" };
import clientManifest from "./dist/static/manifest.json" assert { type: "json" };
import { createServer } from "node:http";
import sirv from "sirv";

globalThis.serverManifest = serverManifest;
globalThis.clientManifest = clientManifest;

const sirvMiddleware = sirv("dist/static");
const hattipMiddleware = createMiddleware(hattipHandler);

createServer(
	// Chain middlewares manually
	(req, res) => sirvMiddleware(req, res, () => hattipMiddleware(req, res)),
).listen(3000, () => {
	console.log(`Server listening on http://localhost:3000`);
});
