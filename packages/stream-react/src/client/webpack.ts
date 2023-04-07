declare global {
	var moduleCache: Map<string, any>;
	function __webpack_chunk_load__(chunk: string): Promise<void>;
	function __webpack_require__(id: string): any;
	var __rsc__: { root: string; manifest: { [key: string]: { file: string } } };
}

export function setupWebpackEnv(
	load: (chunk: string) => Promise<any> = async (chunk) =>
		await import(/* @vite-ignore */ chunk),
) {
	const cache = new Map<string, any>();

	(globalThis as any).__webpack_chunk_load__ = async (chunk: string) => {
		console.log("Loading chunk", chunk);
		cache.set(chunk, await load(chunk));
	};

	(globalThis as any).__webpack_require__ = (id: string) => {
		console.log("Requiring chunk", id);
		if (!cache.has(id)) throw new Error(`Module ${id} not found`);
		return cache.get(id);
	};
}
