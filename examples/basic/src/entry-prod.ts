import { createServer as createHttpServer } from "node:http";
import { handleRequest } from "./entry-handler";

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

async function main() {
	const port = Number(process.env.PORT) || 3000;
	const host = process.env.HOST || "localhost";

	const httpServer = createHttpServer(async (req, res) => {
		try {
			await handleRequest(req, res);
		} catch (error: any) {
			if (!(error instanceof Error)) {
				error = new Error("Unknown error");
			}

			console.error(error);
			res.statusCode = 500;
			let html = `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>${error.message}</h1><code>${error.stack}</code></body></html>`;

			res.setHeader("Content-Type", "text/html; charset=utf-8");
			res.end(html);
		}
	});

	httpServer.listen(port, host, () => {
		console.log(`Server started at http://${host}:${port}`);
	});
}
