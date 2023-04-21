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
	useCallback,
	useState,
} from "react";
import * as React from "react";
import { routerContext } from "stream-react/router";
import { createElementFromServer } from "stream-react/client";
import { refresh } from "stream-react/refresh";
import { addMutationListener } from "stream-react/mutation";
import { NotFoundBoundary } from "../NotFoundBoundary";
import { RedirectBoundary } from "./RedirectBoundary";

export function useRerender() {
	const [_, rerender] = useState(() => 0);
	return useCallback(() => {
		rerender((n) => n + 1);
	}, [rerender]);
}

type RouterState = {
	url: string;
	cache: Map<string, React.Thenable<React.ReactElement>>;
};

type RouterAction = { type: "navigate"; url: string };

function clientReducer(state: RouterState, action: RouterAction) {
	switch (action.type) {
		case "navigate":
			if (!state.cache.has(action.url)) {
				state.cache.set(action.url, createElementFromServer(action.url));
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
	notFound,
}: {
	children: React.ReactNode;
	initialURL: string;
	notFound?: React.ReactNode;
}) {
	const existingRouter = use(routerContext);
	const [cache] = useState(
		() => new Map<string, React.Thenable<React.ReactElement>>(),
	);
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
			preload(url: string): React.Thenable<React.ReactElement> | Promise<any> {
				if (!cache.has(url)) {
					const promise = createElementFromServer(url);
					cache.set(url, promise);
					return promise;
				}
				return Promise.resolve();
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
			if (enabledRef.current) {
				console.log(state.url, val);
				state.cache.set(state.url, val);
				startTransition(() => {
					renrender();
				});
			}
		});
	}, [state, router, renrender]);

	const content = state.cache.get(state.url);

	return (
		<routerContext.Provider value={{ url: state.url, ...router }}>
			<RedirectBoundary>
				<NotFoundBoundary notFound={notFound}>
					<LayoutRouter child={content} />
				</NotFoundBoundary>
			</RedirectBoundary>
		</routerContext.Provider>
	);
}
const layoutContext = React.createContext<{}>({});

export function LayoutRouter({
	child,
	segment,
}: {
	child: any;
	segment?: string;
}) {
	return (
		<layoutContext.Provider key={segment} value={{}}>
			<RedirectBoundary>
				<NotFoundBoundary notFound={<div>404</div>}>
					<InnerLayoutRouter child={child} />
				</NotFoundBoundary>
			</RedirectBoundary>
		</layoutContext.Provider>
	);
}

function InnerLayoutRouter({ child }: { child: any }) {
	const resolvedContext = child?.then ? use(child) : child ?? (null as any);
	return resolvedContext;
}
