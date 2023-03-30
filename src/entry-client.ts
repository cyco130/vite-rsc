import { createFromFetch } from "react-server-dom-webpack/client.browser";
import { createRoot } from "react-dom/client";

run().catch((err) => console.error(err));

async function run() {
	const root = createRoot(document.getElementById("app")!);
	const app = await createFromFetch(fetch("/rsc?name=RSC"), {
		callServer(...args: any[]) {
			console.log(args);
			throw new Error("Not implemented");
		},
	});

	root.render(app);
}

const cache = new Map<string, any>();

(globalThis as any).__webpack_chunk_load__ = async (chunk: string) => {
	cache.set(chunk, await import(/* @vite-ignore */ chunk));
};

(globalThis as any).__webpack_require__ = (id: string) => {
	return cache.get(id);
};
