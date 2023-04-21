export function request(): Request {
	return globalThis.requestAsyncContext.getStore()!.request;
}

export function headers(): Headers {
	return globalThis.requestAsyncContext.getStore()!.request.headers;
}

export function response(): ResponseInit {
	return globalThis.requestAsyncContext.getStore()!.response;
}
