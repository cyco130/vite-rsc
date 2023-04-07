"use client";

import { createBrowserHistory, createMemoryHistory, createPath } from "history";
import {
	startTransition,
	use,
	useEffect,
	useLayoutEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import * as React from "react";
import { RouterContext } from "../../shared/useRouter";
import { RedirectBoundary } from "./RedirectBoundary";
import { createElementFromRSCFetch } from "../stream";
import { refresh } from "../refresh";
import { addMutationListener } from "../mutation";
import { useRerender } from "../hooks";

type RouterState = {
	url: string;
	cache: Map<string, React.Thenable<React.ReactElement>>;
};

type RouterAction = { type: "navigate"; url: string };

function clientReducer(state: RouterState, action: RouterAction) {
	switch (action.type) {
		case "navigate":
			if (!state.cache.has(action.url)) {
				state.cache.set(action.url, createElementFromRSCFetch(action.url));
			}
			return { ...state, url: action.url };
		default:
			return state;
	}
}

function serverReducer(state: RouterState, action: RouterAction) {
	return state;
}

const reducer = typeof window === "undefined" ? serverReducer : clientReducer;

// Main Router component, should be rendered with the initial request during SSR
// and hydrated on the client. But because it's meant to be a nested router, after
// initial hydration, it should replace it's children using client side navigation, but
// fetching the contents of the new route from the server (RSC)
export default function Router({
	children,
	initialURL,
}: {
	children: React.ReactNode;
	initialURL: string;
}) {
	const existingRouter = use(RouterContext);
	const [cache] = useState(() => new Map<string, Promise<JSX.Element>>());
	const enabledRef = useRef(true);
	const initialState = useMemo(() => {
		cache.set(initialURL, children as any);
		return {
			url: initialURL,
			cache: cache,
		};
	}, [initialURL, cache, children]);

	const renrender = useRerender();

	const [state, dispatch] = useReducer(reducer, initialState);
	const router = useMemo(() => {
		const history =
			typeof window === "undefined"
				? createMemoryHistory()
				: createBrowserHistory();

		return {
			push(url: string, state: any) {
				history.push(url, state);
				startTransition(() => dispatch({ type: "navigate", url }));
			},
			replace(url: string, state: any) {
				history.replace(url, state);
				startTransition(() => dispatch({ type: "navigate", url }));
			},
			mutate: globalThis.mutate,
			refresh: refresh,
			history,
			cache,
			disable() {
				enabledRef.current = false;
			},
			enable() {
				enabledRef.current = true;
			},
		};
	}, [dispatch, cache]);

	useEffect(() => {
		return router.history.listen((update) => {
			if (enabledRef.current && update.action === "POP") {
				startTransition(() => {
					dispatch({ type: "navigate", url: createPath(update.location) });
				});
			}
		});
	}, [router]);

	useLayoutEffect(() => {
		if (existingRouter) {
			existingRouter.disable();
		}
		return () => {
			if (existingRouter) {
				existingRouter.enable();
			}
		};
	});

	useEffect(() => {
		return addMutationListener((val) => {
			if (enabledRef.current)
				startTransition(() => {
					initialState.cache.set(initialState.url, val);
					renrender();
				});
		});
	}, [initialState.url, router, renrender]);

	const content = state.cache.get(state.url);

	return (
		<RouterContext.Provider value={{ url: state.url, ...router }}>
			<RedirectBoundary>
				<LayoutRouter childNode={content} />
			</RedirectBoundary>
		</RouterContext.Provider>
	);
}

function LayoutRouter({ childNode }: { childNode: any }) {
	const resolvedContext = childNode?.then
		? use(childNode)
		: childNode ?? (null as any);
	return resolvedContext;
}
