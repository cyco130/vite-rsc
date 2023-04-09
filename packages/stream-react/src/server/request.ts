export function request(): Request {
	return globalThis.requestAsyncContext.getStore()!.request;
}

export function response(): ResponseInit {
	return globalThis.requestAsyncContext.getStore()!.response;
}
