import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["./src/index.ts"],
		format: ["esm"],
		platform: "node",
		target: "node14",
		dts: true,
	},
	{
		entry: ["./src/cli.ts"],
		format: ["cjs"],
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
	{
		entry: {
			"entry-server": "./src/entry-server.ts",
		},
		dts: false,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
		external: ["~/root?rsc"],
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
	{
		entry: {
			"entry-client": "./src/entry-client.tsx",
		},
		dts: false,
		format: ["esm"],
		platform: "node",
		target: "esnext",
		shims: false,
	},
]);
