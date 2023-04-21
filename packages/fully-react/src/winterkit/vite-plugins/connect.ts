import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, UserConfig } from "vite";

import type { Stats } from "node:fs";
import path from "node:path";
import url from "node:url";

const dirname =
	typeof __dirname === "undefined"
		? url.fileURLToPath(new URL(".", import.meta.url))
		: __dirname;

export interface VaviteConnectOptions {
	/** Entry module that default exports a middleware function.
	 * @default "/handler" (which resolves to handler.js, handler.ts etc.
	 * in your project root)
	 */
	handlerEntry?: string;

	/** Cusotm server entry the production build. */
	customServerEntry?: string;

	/** Whether to serve client-side assets in development.
	 * @default false
	 */
	serveClientAssetsInDev?: boolean;

	/** Whether to build a standalone server application or a middleware function.
	 * @default true
	 */
	standalone?: boolean;

	/** Directory where the client-side assets are located. Set to null to disable
	 * static file serving in production.
	 * @default null
	 */
	clientAssetsDir?: string | null;

	/** Whether to bundle the sirv package or to import it. You have to install it as
	 * a production dependency if this is set to false.
	 * @default true
	 */
	bundleSirv?: boolean;
}

export default function connect(): Plugin[] {
	return [
		{
			name: "@vavite/connect:resolve",

			enforce: "pre",

			async resolveId(id) {
				if (id === "/virtual:vavite-connect-handler") {
					return this.resolve("fully-react/entry-server");
				} else if (id === "/virtual:vavite-connect-server") {
					return path
						.resolve(dirname, "entry-standalone-bundled-sirv.js")
						.replace(/\\/g, "/");
				}
			},
		},
		{
			name: "@vavite/connect:server",

			enforce: "post",

			config(config, env) {
				const common: UserConfig = {
					optimizeDeps: {
						// This silences the "could not auto-determine entry point" warning
						include: [],
					},
				};

				if (env.command === "build" && config.build?.ssr) {
					if (process.env.RSC_WORKER) {
						return {
							...common,
						};
					}
					return {
						...common,
						define: {
							CLIENT_BUILD_OUTPUT_DIR: JSON.stringify("dist/static"),
						},
					};
				}

				return common;
			},

			configureServer(server) {
				function addMiddleware() {
					server.middlewares.use(async (req, res) => {
						function renderError(status: number, message: string) {
							res.statusCode = status;
							res.end(message);
						}

						// Restore the original URL (SPA middleware may have changed it)
						req.url = req.originalUrl || req.url;

						try {
							const module = await server.ssrLoadModule(
								"virtual:hattip:dev-entry",
							);

							await module.default(req, res, () => {
								if (!res.writableEnded) renderError(404, "Not found");
							});
						} catch (err) {
							if (err instanceof Error) {
								server.ssrFixStacktrace(err);
								renderError(500, err.stack || err.message);
							} else {
								renderError(500, "Unknown error");
							}
						}
					});
				}

				return addMiddleware;
			},
		},
	];
}

type Arrayable<T> = T | T[];

export interface SirvOptions {
	dev?: boolean;
	etag?: boolean;
	maxAge?: number;
	immutable?: boolean;
	single?: string | boolean;
	ignores?: false | Arrayable<string | RegExp>;
	extensions?: string[];
	dotfiles?: boolean;
	brotli?: boolean;
	gzip?: boolean;
	onNoMatch?: (req: IncomingMessage, res: ServerResponse) => void;
	setHeaders?: (res: ServerResponse, pathname: string, stats: Stats) => void;
}
