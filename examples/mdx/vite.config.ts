import { defineConfig } from "vite";
import react from "vite-react-server";
import mdx from "@mdx-js/rollup";
export default defineConfig({
	plugins: [mdx({}), react()],
});
