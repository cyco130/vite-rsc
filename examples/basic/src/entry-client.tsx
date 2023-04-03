import { hydrateRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client.browser";

// hydrateRoot(document.documentElement, <App path={window.location.pathname} />);

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

async function main() {
	const output = await createFromFetch(fetch("/__rsc"));
	const app = document.getElementById("app")!;
	hydrateRoot(app, output);
}

const cache = new Map<string, any>();

(globalThis as any).__webpack_chunk_load__ = async (chunk: string) => {
	console.log("Loading chunk", chunk);
	cache.set(chunk, await import(/* @vite-ignore */ chunk));
};

(globalThis as any).__webpack_require__ = (id: string) => {
	console.log("Requiring chunk", id);
	if (!cache.has(id)) throw new Error(`Module ${id} not found`);
	return cache.get(id);
};
