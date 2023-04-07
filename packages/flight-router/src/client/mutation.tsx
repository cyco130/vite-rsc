declare global {
	interface Window {
		init_rsc: ReadableStream<Uint8Array> | null;
		rsc_chunk(chunk: string): Promise<void>;
	}
	export var isMutating: number;
	export function mutate(data: any): void;
	export function addMutationListener(callback: (any: any) => void): () => void;
	export var mutationListeners: ((any: any) => void)[];
}

export function initMutation() {
	globalThis.isMutating = 0;
	globalThis.mutationListeners = [];
	globalThis.mutate = (data: any) => {
		for (const listener of globalThis.mutationListeners) {
			listener(data);
		}
	};
}

export function addMutationListener(callback: (any: any) => void) {
	globalThis.mutationListeners.push(callback);
	return () => {
		removeMutationListener(callback);
	};
}

export function removeMutationListener(callback: (any: any) => void) {
	const index = globalThis.mutationListeners.indexOf(callback);
	if (index !== -1) {
		globalThis.mutationListeners.splice(index, 1);
	}
}
export function mutate(fn: () => Promise<void>) {
	++globalThis.isMutating;
	const result = fn();
	--globalThis.isMutating;
	return result;
}
