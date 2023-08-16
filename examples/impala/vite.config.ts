import { defineConfig } from "vite";
import impala from "@impalajs/core/plugin";
import react from "fully-react/rsc-plugin";
import path from "path";

export default defineConfig({
	plugins: [impala(), react({ server: false })],
	build: {
		rollupOptions: {
			input: ["/src/entry-client.tsx"],
		},
		ssrEmitAssets: true,
	},
});
