import { defineConfig } from "vite";
import react from "./modules/vite/react";
import inspect from "vite-plugin-inspect";
import unocss from "unocss/vite";
import { devtools } from "./modules/devtools/devtools.vite";
import path from "path";
export default defineConfig({
	plugins: [
		devtools(),
		react(),
		inspect(),
		unocss({
			configFile: "unocss.config.ts",
		}),
	],
	resolve: {
		alias: {
			winter: "modules",
			"~": path.resolve(process.cwd(), "app"),
		},
	},
	ssr: {
		external: ["react-server-dom-webpack"],
	},
});
