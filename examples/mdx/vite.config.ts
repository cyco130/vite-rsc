import { defineConfig } from "vite";
import react from "vite-react-server";
import mdx from "@cyco130/vite-plugin-mdx";
export default defineConfig({
	plugins: [mdx({}), react()],
});
