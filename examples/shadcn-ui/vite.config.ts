import { defineConfig } from "vite";
import react from "fully-react/rsc-plugin";
import reactRefresh from "@vitejs/plugin-react";

export default defineConfig({
	ssr: {
		external: ["react/jsx-dev-runtime", "@react-refresh"],
	},
	plugins: [react()],
});
