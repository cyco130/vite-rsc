import { defineConfig } from "vite";
import react from "vite-react-server";
import tsconfigPaths from "vite-tsconfig-paths";
import inspect from "vite-plugin-inspect";
import reactRefresh from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";

export default defineConfig({
	ssr: {
		external: ["react/jsx-dev-runtime", "@react-refresh"],
	},
	plugins: [mdx({}), inspect(), tsconfigPaths(), reactRefresh(), react()],
});
