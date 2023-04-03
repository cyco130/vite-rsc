import { defineConfig } from "vite";
import { reactServerComponents } from "vite-rsc";
import inspect from "vite-plugin-inspect";

export default defineConfig((env) => ({
	build: {
		rollupOptions: {
			input: { "entry-client": "src/entry-client.tsx" },
		},
	},
	plugins: [inspect(), reactServerComponents()],
}));
