import { defineConfig } from "vite";
import reactServerComponents from "fully-react/rsc-plugin";
import inspect from "vite-plugin-inspect";

export default defineConfig((env) => ({
	build: {
		rollupOptions: {
			input: { "entry-client": "src/entry-client.tsx" },
		},
	},
	plugins: [inspect(), reactServerComponents()],
}));
