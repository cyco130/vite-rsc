export function request() {
	return globalThis.requestAsyncContext.getStore()!.request;
}
