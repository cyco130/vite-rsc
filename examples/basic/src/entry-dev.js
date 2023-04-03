// @ts-check
import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import path from "path";

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

async function main() {
	const viteServer = await createViteServer({
		appType: "custom",
		server: { middlewareMode: true },
	});

	let { port = 3000, host } = viteServer.config.server;
	if (!host) host = "localhost";
	if (host === true) host = "0.0.0.0";

	const handlerPath = path.resolve(
		viteServer.config.root,
		"src/entry-handler.ts",
	);

	const httpServer = createHttpServer(async (req, res) => {
		viteServer.middlewares(req, res, async () => {
			try {
				const { handleRequest } =
					/** @type typeof import("./entry-handler") */
					(await viteServer.ssrLoadModule(handlerPath));

				await handleRequest(req, res);
			} catch (error) {
				if (error instanceof Error) {
					viteServer.ssrFixStacktrace(error);
				} else {
					error = new Error("Unknown error");
				}

				console.error(error);
				res.statusCode = 500;
				let html = `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>${error.message}</h1><code>${error.stack}</code></body></html>`;

				html = await viteServer.transformIndexHtml(req.url || "/", html);

				res.setHeader("Content-Type", "text/html; charset=utf-8");
				res.end(html);
			}
		});
	});

	httpServer.listen(port, host, () => {
		viteServer.config.logger.info(`Server started at http://${host}:${port}`);
	});
}
