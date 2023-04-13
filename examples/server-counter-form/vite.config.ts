import { defineConfig, loadEnv } from "vite";
import react from "vite-react-server";

process.env = {
	...process.env,
	...loadEnv("development", process.cwd()),
};

export default defineConfig({
	plugins: [react()],
});
