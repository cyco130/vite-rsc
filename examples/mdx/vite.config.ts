import { defineConfig } from "vite";
import reactServerComponents from "fully-react";
import mdx from "@cyco130/vite-plugin-mdx";

export default defineConfig({
	plugins: [mdx({}), reactServerComponents()],
});
