import { useCallback, useState } from "react";

import { useRouter } from "./router";

declare global {
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

export const useMutation = () => {
	const [state, setState] = useState();
	const router = useRouter();

	if (state) {
		throw state;
	}

	return useCallback(
		async function <T extends (...args: any[]) => void>(fn: T) {
			try {
				return await router.mutate(() => {
					return fn();
				});
			} catch (error: any) {
				setState(error);
			}
		},
		[router],
	);
};
