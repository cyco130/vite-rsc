import { ModuleMap as ModuleMap } from "./streams";

declare global {
	var moduleCache: Map<string, any>;
	function __webpack_chunk_load__(chunk: string): Promise<void>;
	function __webpack_require__(id: string): any;
}

function dynamicImport(chunk: string) {
	return import(/* @vite-ignore */ chunk);
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
		globalThis.moduleCache.set(chunk, await load(chunk));
	};

	globalThis.__webpack_require__ = (id: string) => {
		if (!globalThis.moduleCache.has(id))
			throw new Error(`Module ${id} not found`);
		return globalThis.moduleCache.get(id);
	};
}

/**
 * This is another hack to make vite dev server work with react-server-dom-webpack.
 * We use a proxy during dev in order to make the bundler config look like the one that
 * react-server-dom-webpack expects at build time.
 */
export function createModuleMapProxy(): ModuleMap {
	return new Proxy(
		{},
		{
			get(_, prop) {
				const [id, name] = String(prop).split("#", 2);
				return {
					id,
					chunks: [id],
					name,
				};
			},
		},
	);
}
