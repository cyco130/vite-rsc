import { defineConfig } from "vite";
import react from "vite-react-server";
import reactRefresh from "@vitejs/plugin-react";

export default defineConfig({
	ssr: {
		external: ["react/jsx-dev-runtime", "@react-refresh"],
	},
	plugins: [react()],
});
