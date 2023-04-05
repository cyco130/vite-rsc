import { defineConfig } from "vite";
import react from "vite-react-server";
import reactRefresh from "@vitejs/plugin-react";

export default defineConfig({
	ssr: {
		external: ["react/jsx-dev-runtime", "@react-refresh"],
	},
	plugins: [reactRefresh(), react()],
});

function hasRscQuery(id: string) {
	const query = splitQuery(id)[1];
	return query.match(/(^|&)rsc($|&|=)/);
}

function addRscQuery(id: string) {
	if (id.includes("?")) {
		return id + "&rsc";
	} else {
		return id + "?rsc";
	}
}

function removeRscQuery(id: string) {
	const [base, query] = splitQuery(id);
	if (!query) return id;

	const newQuery = query
		.split("&")
		.filter((part) => !part.match(/rsc($|=)/))
		.join("&");

	if (newQuery) return base;

	return base + "?" + newQuery;
}

function splitQuery(id: string) {
	const index = id.indexOf("?");
	if (index === -1) return [id, ""];
	return [id.slice(0, index), id.slice(index + 1)];
}
