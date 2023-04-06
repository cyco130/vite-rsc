import { defineConfig } from "vite";
import react from "vite-react-server";
import tsconfigPaths from "vite-tsconfig-paths";
import inspect from "vite-plugin-inspect";
import reactRefresh from "@vitejs/plugin-react";

export default defineConfig({
	ssr: {
		external: ["react/jsx-dev-runtime", "@react-refresh"],
	},
	plugins: [
		tsconfigPaths(),
		reactRefresh(),
		react({
			serverEntry: "./app/entry-server.ts",
		}),
	],
});
