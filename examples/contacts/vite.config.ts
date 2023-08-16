import { defineConfig } from "vite";
import react from "fully-react/rsc-plugin";

export default defineConfig({
	build: {
		rollupOptions: {
			input: { root: "app/root.tsx" },
		},
	},
	plugins: [react()],
});
