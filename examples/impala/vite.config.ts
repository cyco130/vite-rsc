import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import impala from "@impalajs/core/plugin";
import { reactServerComponents } from "vite-rsc";

export default defineConfig({
	plugins: [react(), impala(), reactServerComponents()],
	build: {
		rollupOptions: {
			input: {
				"entry-client": "src/entry-client.tsx",
				index: "index.html",
			},
		},
	},
});
