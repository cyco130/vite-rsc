import type { ViteDevServer } from "vite";

const viteDevServer = (
	process.env.NODE_ENV === "production"
		? new Proxy({} as ViteDevServer, {
				get() {
					throw new Error("Vite dev server is not available in production");
				},
		  })
		: globalThis.__vite_dev_server__
) as ViteDevServer & { rscWorker: any };

export default viteDevServer;
