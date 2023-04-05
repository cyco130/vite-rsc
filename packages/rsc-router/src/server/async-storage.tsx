import { AsyncLocalStorage } from "async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage<{ request: Request }>();

export function request() {
	return asyncLocalStorage.getStore()!.request;
}
