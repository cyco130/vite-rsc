import { createPath, createBrowserHistory } from "history";
import {
	useState,
	useMemo,
	startTransition,
	useEffect,
	use,
	useCallback,
} from "react";
import {
	createFromFetch,
	encodeReply as encodeActionArgs,
	createFromReadableStream,
} from "react-server-dom-webpack/client.browser";
import { RouterAPI, useRouter } from "./router/useRouter";

const decoder = new TextDecoder();

let mutationMode = 0;
const mutationCallbacks = [] as ((any: any) => void)[];
export function addMutationListener(callback: (any: any) => void) {
	mutationCallbacks.push(callback);
	return () => {
		removeMutationListener(callback);
	};
}

export function removeMutationListener(callback: (any: any) => void) {
	const index = mutationCallbacks.indexOf(callback);
	if (index !== -1) {
		mutationCallbacks.splice(index, 1);
	}
}
export function mutate(fn: () => Promise<void>) {
	++mutationMode;
	const result = fn();
	--mutationMode;
	return result;
}

declare global {
	interface Window {
		init_rsc: ReadableStream<Uint8Array> | null;
		rsc_chunk(chunk: string): Promise<void>;
	}
}

export async function callServer(id: string, args: any[]) {
	const actionId = id;

	const isMutating = !!mutationMode;

	const response = await fetch("", {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"x-action": actionId,
			"x-mutation": isMutating ? "1" : "0",
		},
		body: await encodeActionArgs(args),
	});

	if (!response.ok) {
		throw new Error("Server error");
	}

	const data = createFromReadableStream(response.body!, { callServer });

	if (isMutating) {
		mutationCallbacks[0](data);
	}

	return data;
}

export async function submitForm(formData: FormData) {
	const response = await fetch("", {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"x-action": formData.get("$$id") as string,
			"x-mutation": "1",
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error("Server error");
	}

	const data = createFromReadableStream(response.body!, { callServer });

	mutationCallbacks[0](data);

	return data;
}

export function useSubmitForm() {
	const router = useRouter();
	return useCallback(
		async (formData: FormData) => {
			const response = await fetch("", {
				method: "POST",
				headers: {
					Accept: "text/x-component",
					"x-action": formData.get("$$id") as string,
					"x-mutation": "1",
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Server error");
			}

			const data = createFromReadableStream(response.body!, { callServer });

			const redirectURL = response.headers.get("x-redirect");
			if (redirectURL) {
				router.cache.set(redirectURL, data);
				router.push(redirectURL);
			} else {
				mutationCallbacks[0](data);
			}

			return data;
		},
		[router],
	);
}

export function refreshRSC() {
	const element = createElementFromRSCFetch();
	mutationCallbacks.forEach((callback) => callback(element));
}

export function createElementFromRSCFetch(url = "") {
	return createFromFetch(
		fetch(url, {
			headers: {
				Accept: "text/x-component",
				"x-rsc": "1",
				"x-navigate": url,
			},
		}),
	);
}

function createDevtoolsStream() {
	let previousChunkTime: number | null = null;
	const transformStream = new TransformStream({
		transform(chunk, controller) {
			const currentTime = Date.now();

			if (previousChunkTime !== null) {
				const timeDifference = currentTime - previousChunkTime;
				console.log(`Time difference from previous chunk: ${timeDifference}ms`);
			} else {
				console.log("Received the first chunk");
			}

			console.log(`Chunk: ${decoder.decode(chunk)}`);
			previousChunkTime = currentTime;

			// Pass the chunk along the stream without modification
			controller.enqueue(chunk);
		},
	});
	return transformStream;
}

export async function createElementFromRSCStream(
	stream: ReadableStream | Promise<ReadableStream>,
	config: any,
) {
	stream = await stream;
	if (import.meta.env.DEV) {
		const devtoolsStream = createDevtoolsStream();
		stream = stream.pipeThrough(devtoolsStream);
	}

	return createFromReadableStream(stream, config);
}

export function getRSCStream(url: string) {
	let stream;
	// Ideally we should have a readable stream inlined in the HTML
	if (window.init_rsc) {
		stream = window.init_rsc;
		self.init_rsc = null;
	} else {
		stream = fetch(`/__rsc${url}`, {
			headers: {
				Accept: "text/x-component",
				"x-navigate": url,
			},
		}).then((res) => res.body!);
	}

	return stream;
}

export const rscCache = new Map<string, Promise<JSX.Element>>();

export function useRSCStream(url: string) {
	if (!rscCache.has(url)) {
		rscCache.set(
			url,
			createElementFromRSCStream(getRSCStream(url), {
				callServer,
			}),
		);
	}
	return rscCache.get(url)!;
}

export function useRerender() {
	const [_, rerender] = useState(() => 0);
	return useCallback(() => {
		rerender((n) => n + 1);
	}, [rerender]);
}

export function useRSCClientRouter() {
	const [url, setURL] = useState(() => createPath(new URL(location.href)));
	const render = useRerender();
	const router = useMemo(() => {
		const history = createBrowserHistory();
		return {
			push: (url: string) => {
				history.push(url);
				startTransition(() => {
					setURL(url);
				});
			},
			replace: (url: string) => {
				history.replace(url);
				startTransition(() => {
					setURL(url);
				});
			},
			mutate: mutate,
			refresh: refreshRSC,
			history,
			cache: rscCache,
		} satisfies Omit<RouterAPI, "url">;
	}, [setURL]);

	useEffect(() => {
		return router.history.listen((update) => {
			if (update.action === "POP") {
				startTransition(() => {
					setURL(createPath(update.location));
				});
			}
		});
	}, [router]);

	useEffect(() => {
		// this should only be triggered if no other mutation listeners have been added below it
		return addMutationListener((val) => {
			startTransition(() => {
				rscCache.set(url, val);
				render();
			});
		});
	}, [url, router]);

	return { ...router, url } as const;
}

export function RSCElement({ url }: { url: string }) {
	return use(useRSCStream(url));
}
