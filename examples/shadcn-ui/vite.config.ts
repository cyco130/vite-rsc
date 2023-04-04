import { defineConfig } from "vite";
import react from "vite-react-server";
import tsconfigPaths from "vite-tsconfig-paths";
import inspect from "vite-plugin-inspect";

export default defineConfig({
	plugins: [inspect(), tsconfigPaths(), react()],
});
