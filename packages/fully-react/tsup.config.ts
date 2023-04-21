import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["./src/index.ts"],
		format: ["esm"],
		platform: "node",
		target: "node14",
		external: [],
		dts: true,
	},
	{
		entry: ["./src/fs-router.ts"],
		format: ["esm"],
		platform: "node",
		target: "node14",
		dts: true,
	},
	{
		entry: ["./src/cli.ts"],
		format: ["cjs"],
		platform: "node",
		target: "node14",
		external: ["@vercel/nft"],
	},
	// {
	// 	entry: {
	// 		index: "./src/vite-plugin.ts",
	// 		cli: "./src/index.ts",
	// 	},
	// 	format: ["esm"],
	// 	platform: "node",
	// 	dts: {
	// 		entry: {
	// 			index: "./src/vite-plugin.ts",
	// 		},
	// 		resolve: false,
	// 	},
	// },
	{
		entry: {
			"entry-standalone": "./src/winterkit/entry/entry-standalone.ts",
			"entry-standalone-imported-sirv":
				"./src/winterkit/entry/entry-standalone-with-sirv.ts",
			"entry-vercel": "./src/winterkit/entry/entry-vercel.ts",
		},
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["sirv", "/virtual:vavite-connect-handler"],
	},
	{
		entry: {
			"entry-standalone-bundled-sirv":
				"./src/winterkit/entry/entry-standalone-with-sirv.ts",
		},
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["/virtual:vavite-connect-handler"],
		noExternal: ["sirv"],
	},
	{
		entry: {
			node: "./src/winterkit/node.ts",
		},
		dts: true,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["/virtual:vavite-connect-handler"],
		noExternal: ["sirv"],
	},
	{
		entry: ["./src/server/*", "./src/shared/*", "./src/entry-server.ts"],
		dts: true,
		format: ["esm"],
		outDir: "./dist",
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["react", "react-dom", "react-server-dom-webpack", "fully-react"],
	},
	{
		entry: {
			"entry-rsc.development": "./src/entry-rsc.tsx",
		},
		env: {
			NODE_ENV: "development",
		},
		dts: false,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		treeshake: true,
		shims: false,
		external: ["fully-react", "virtual:vite-dev-server"],
	},
	{
		entry: {
			"entry-rsc.production": "./src/entry-rsc.tsx",
		},
		env: {
			NODE_ENV: "production",
		},
		dts: false,
		minify: true,
		treeshake: true,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["fully-react"],
	},
	{
		entry: {
			"rsc-worker": "./src/rsc-worker.ts",
		},
		dts: false,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["react-server-dom-webpack", "vite", "vite-node"],
	},
	// {
	// 	entry: ["./src/entry-client.tsx"],
	// 	outDir: "./dist",
	// 	dts: true,
	// 	format: ["esm"],
	// 	platform: "neutral",
	// 	target: "esnext",
	// 	shims: false,
	// 	external: ["./src/web/entry.tsx"],
	// },
]);
