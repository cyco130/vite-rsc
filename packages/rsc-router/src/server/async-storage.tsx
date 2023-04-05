import { AsyncLocalStorage } from "async_hooks";

export const asyncLocalStorage =
	globalThis.requestLocalStorage ??
	new AsyncLocalStorage<{ request: Request }>();
globalThis.requestLocalStorage = asyncLocalStorage;

export function request() {
	return asyncLocalStorage.getStore()!.request;
}
