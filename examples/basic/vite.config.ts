import { defineConfig } from "vite";
import react from "fully-react";
import inspect from "vite-plugin-inspect";

export default defineConfig((env) => ({
	plugins: [inspect(), react()],
}));
