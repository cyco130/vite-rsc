import { defineConfig } from "tsup";

export default defineConfig([
	// {
	// 	entry: ["./src"],
	// 	format: ["esm"],
	// 	external: [
	// 		"virtual:vite-dev-server",
	// 		"react",
	// 		"react-server-dom-webpack",
	// 		"react-dom",
	// 	],
	// 	dts: true,
	// },
	{
		entry: ["./src"],
		format: ["esm"],
		esbuildOptions: (options) => {
			options.splitting = false;
		},
		external: [
			"~/root?rsc",
			"virtual:vite-dev-server",
			"react",
			"react-server-dom-webpack",
			"react-dom",
		],
		platform: "node",
		target: "node14",
		dts: true,
	},
]);
