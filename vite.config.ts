import { defineConfig } from "vite";
import react from "./modules/vite/react";
import inspect from "vite-plugin-inspect";
import unocss from "unocss/vite";
import { devtools } from "./modules/devtools/devtools.vite";
import paths from "vite-tsconfig-paths";
import icons from "unplugin-icons/vite";

export default defineConfig({
	plugins: [
		paths(),
		devtools(),
		react(),
		inspect(),
		icons({ compiler: "jsx" }),
		unocss({
			configFile: "unocss.config.ts",
		}),
	],
	resolve: {
		alias: {
			"~": "app",
		},
	},

	ssr: {
		external: ["react-server-dom-webpack"],
	},
});
