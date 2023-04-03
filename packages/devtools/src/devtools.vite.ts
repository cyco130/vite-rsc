import { Plugin } from "vite";
// import { createRPCServer } from "vite-dev-rpc";
// import { ClientFunctions, ServerFunctions } from "~/rpc";

export function devtools() {
	return {
		name: "devtools",
		configureServer(server) {
			// const rpc = createRPCServer<ClientFunctions, ServerFunctions>(
			// 	"devtools",
			// 	server.ws,
			// 	{
			// 		add(a, b) {
			// 			// eslint-disable-next-line no-console
			// 			console.log(`RPC ${a} ADD ${b}`);
			// 			const result = a + b;
			// 			if (result > 150) {
			// 				setTimeout(() => {
			// 					rpc.alert.asEvent(`Someone got ${result}!`);
			// 				}, 50);
			// 			}
			// 			return result;
			// 		},
			// 	},
			// );
			server.middlewares.use("/__devtools", async (req, res, next) => {
				res.end(
					await server.transformIndexHtml(
						req.originalUrl as string,
						`<!DOCTYPE html><html class="dark"><head><style>
							:root {
								--nui-c-context: 125,125,125;
							}
							
							html, body {
								background-color: transparent;
							}
							
							html.dark {
								color: white;
							}
							
							</style></head><body style="background-color: transparent">
							<div id="devtools" />
							<script type="module" src="/modules/devtools/devtools.main.tsx"></script>
							</body></html>`,
					),
				);
			});
		},
	} satisfies Plugin;
}
