export function setupWebpackEnv() {
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
}
