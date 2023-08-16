import { defineConfig } from "vite";
import react from "fully-react/rsc-plugin";
import mdx from "@cyco130/vite-plugin-mdx";
export default defineConfig({
	plugins: [mdx({}), react()],
});
