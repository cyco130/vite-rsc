import { createElementFromRSCStream, callServer } from "./stream";
import { refresh } from "./refresh";
import { RouterContext } from "../shared/useRouter";
import { RouterAPI } from "./router/router-api";
import React, {
	startTransition,
	use,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPath, createBrowserHistory } from "history";
import { mutate, addMutationListener } from "./mutation";
import { useRerender } from "./hooks";

export function getRSCStream(url: string) {
	let stream;
	// Ideally we should have a readable stream inlined in the HTML
	if (window.init_rsc) {
		stream = window.init_rsc;
		self.init_rsc = null;
	} else {
		stream = fetch(`${url}`, {
			headers: {
				Accept: "text/x-component",
				"x-navigate": url,
			},
		}).then((res) => res.body!);
	}

	return stream;
}

export function useRSCClientRouter() {
	const [url, setURL] = useState(() => createPath(new URL(location.href)));
	const enabledRef = useRef(true);
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
			refresh: refresh,
			history,
			cache: rscCache,
			disable() {
				enabledRef.current = false;
			},
			enable() {
				enabledRef.current = true;
			},
		} satisfies Omit<RouterAPI, "url">;
	}, [setURL]);

	useEffect(() => {
		return router.history.listen((update) => {
			if (enabledRef.current) {
				if (update.action === "POP") {
					startTransition(() => {
						setURL(createPath(update.location));
					});
				}
			}
		});
	}, [router]);

	useEffect(() => {
		// this should only be triggered if no other mutation listeners have been added below it
		return addMutationListener((val) => {
			console.log("mutation", enabledRef.current);
			if (enabledRef.current) {
				startTransition(() => {
					rscCache.set(url, val);
					render();
				});
			}
		});
	}, [url, router]);

	return { ...router, url } as const;
}

export function RSCElement({ url }: { url: string }) {
	return use(useRSCStream(url));
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

export function Root() {
	const router = useRSCClientRouter();

	return (
		<RouterContext.Provider value={router}>
			<RSCElement url={router.url} />
		</RouterContext.Provider>
	);
}
