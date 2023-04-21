import { defineConfig, loadEnv } from "vite";

import react from "fully-react";

process.env = {
	...process.env,
	...loadEnv("development", process.cwd()),
};

export default defineConfig({
	plugins: [react()],
});
