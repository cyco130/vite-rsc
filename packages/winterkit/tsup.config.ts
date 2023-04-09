import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: {
			index: "./src/vite-plugin.ts",
			cli: "./src/index.ts",
		},
		format: ["esm"],
		platform: "node",
		dts: {
			entry: {
				index: "./src/vite-plugin.ts",
			},
			resolve: false,
		},
	},
	{
		entry: {
			"entry-standalone": "./src/entry/entry-standalone.ts",
			"entry-standalone-imported-sirv":
				"./src/entry/entry-standalone-with-sirv.ts",
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
				"./src/entry/entry-standalone-with-sirv.ts",
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
			node: "./src/node.ts",
		},
		dts: true,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["/virtual:vavite-connect-handler"],
		noExternal: ["sirv"],
	},
]);
