import { AsyncLocalStorage } from "async_hooks";

declare global {
	export var requestAsyncContext: AsyncLocalStorage<{ request: Request }>;
}

export const requestAsyncContext =
	globalThis.requestAsyncContext ??
	new AsyncLocalStorage<{ request: Request }>();

globalThis.requestAsyncContext = requestAsyncContext;
