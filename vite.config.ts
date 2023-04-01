import { defineConfig } from "vite";
import react from "./modules/vite/react";
import inspect from "vite-plugin-inspect";
import unocss from "unocss/vite";
import { devtools } from "./modules/devtools/devtools.vite";

export default defineConfig({
	plugins: [
		devtools(),
		react(),
		inspect(),
		unocss({
			configFile: "unocss.config.ts",
		}),
	],
	ssr: {
		external: ["react-server-dom-webpack"],
	},
});
