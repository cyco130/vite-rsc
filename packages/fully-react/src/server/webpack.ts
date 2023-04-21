import type { ModuleMap } from "react-server-dom-webpack/server.edge";

function dynamicImport(chunk: string) {
	return import(/* @vite-ignore */ chunk);
}

interface WebpackEnv {
	__webpack_chunk_load__: (chunk: string) => Promise<void>;
	__webpack_require__: (id: string) => any;
	__webpack_chunk_get__: (id: string) => Promise<any>;
	moduleCache: Map<string, any>;
}

export function setupWebpackEnv(
	load: (chunk: string) => Promise<any> = dynamicImport,
) {
	const globalEnv = globalThis as unknown as WebpackEnv;
	/**
	 * This is a hack to make vite dev server work with react-server-dom-webpack.
	 * The cache is persisted between HMR updates on the server.
	 */
	globalEnv.moduleCache = globalEnv.moduleCache ?? new Map<string, any>();

	globalEnv.__webpack_chunk_load__ = async (chunk: string) => {
		console.log("Loading chunk", chunk);
		globalEnv.moduleCache.set(chunk, await load(chunk));
	};

	globalEnv.__webpack_require__ = (id: string) => {
		console.log("Requiring chunk", id);
		if (!globalEnv.moduleCache.has(id))
			throw new Error(`Module ${id} not found`);
		return globalEnv.moduleCache.get(id);
	};

	(globalEnv as any).__webpack_chunk_get__ = async (id: string) => {
		if (!globalEnv.moduleCache.has(id)) return await load(id);
		return globalEnv.moduleCache.get(id);
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
