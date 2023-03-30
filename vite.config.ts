import { defineConfig } from "vite";
import { hattip } from "@hattip/vite";
import { rsc } from "./rsc-plugin";
import inspect from "vite-plugin-inspect";

export default defineConfig({
	plugins: [hattip(), rsc(), inspect()],
	ssr: {
		external: ["react-server-dom-webpack"],
	},
});
