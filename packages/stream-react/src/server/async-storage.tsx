import { AsyncLocalStorage } from "async_hooks";

interface RequestAsyncContext {
	response: ResponseInit;
	request: Request;
}

declare global {
	export var requestAsyncContext: AsyncLocalStorage<RequestAsyncContext>;
}

export const requestAsyncContext =
	globalThis.requestAsyncContext ??
	new AsyncLocalStorage<RequestAsyncContext>();

globalThis.requestAsyncContext = requestAsyncContext;
