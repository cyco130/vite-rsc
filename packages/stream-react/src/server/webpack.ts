function dynamicImport(chunk: string) {
	return import(/* @vite-ignore */ chunk);
}

export interface ModuleMap {
	[key: string]: {
		id: string;
		chunks: string[];
		name: string;
		async?: boolean;
	};
}

export function setupWebpackEnv(
	load: (chunk: string) => Promise<void> = dynamicImport,
) {
	/**
	 * This is a hack to make vite dev server work with react-server-dom-webpack.
	 * The cache is persisted between HMR updates on the server.
	 */
	globalThis.moduleCache = globalThis.moduleCache ?? new Map<string, any>();

	globalThis.__webpack_chunk_load__ = async (chunk: string) => {
		console.log("Loading chunk", chunk);
		globalThis.moduleCache.set(chunk, await load(chunk));
	};

	globalThis.__webpack_require__ = (id: string) => {
		console.log("Requiring chunk", id);
		if (!globalThis.moduleCache.has(id))
			throw new Error(`Module ${id} not found`);
		return globalThis.moduleCache.get(id);
	};

	(globalThis as any).__webpack_chunk_get__ = async (id: string) => {
		if (!globalThis.moduleCache.has(id)) return await load(id);
		return globalThis.moduleCache.get(id);
	};

	return { load };
}

/**
 * This is another hack to make vite dev server work with react-server-dom-webpack.
 * We use a proxy during dev in order to make the bundler config look like the one that
 * react-server-dom-webpack expects at build time.
 */
export function createModuleMapProxy(
	resolve: (id: string) => string = (id) => id,
): ModuleMap {
	return new Proxy(
		{},
		{
			get(_, prop) {
				const [id, name] = String(prop).split("#", 2);
				return {
					id,
					chunks: [resolve(id)],
					name,
				};
			},
		},
	);
}
