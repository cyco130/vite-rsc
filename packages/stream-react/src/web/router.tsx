import { refresh } from "../client/refresh";
import React, {
	startTransition,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPath, createBrowserHistory } from "history";
import { mutate, addMutationListener } from "../client/mutation";
import { useRerender } from "../client/hooks";
import { ServerComponent, serverElementCache } from "./server-component";
import { RouterAPI } from "../client/router/router-api";
import { routerContext } from "../client/router/context";

export function useBaseRouter() {
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
			cache: serverElementCache,
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
					serverElementCache.set(url, val);
					render();
				});
			}
		});
	}, [url, router]);

	return { ...router, url } as const;
}

export function Router() {
	const router = useBaseRouter();

	return (
		<routerContext.Provider value={router}>
			<ServerComponent url={router.url} />
		</routerContext.Provider>
	);
}
