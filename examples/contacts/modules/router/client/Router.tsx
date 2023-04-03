"use client";

import { createFromFetch } from "react-server-dom-webpack/client.browser";
import { createBrowserHistory, createMemoryHistory, History } from "history";

import { startTransition, use, useMemo, useReducer } from "react";
import { RouterContext } from "./useRouter";
import { RedirectBoundary, RedirectErrorBoundary } from "./RedirectBoundary";

type RouterState = {
	url: string;
	cache: Map<string, React.Thenable<React.ReactElement>>;
};

type RouterAction = { type: "navigate"; url: string };

function reducer(state: RouterState, action: RouterAction) {
	switch (action.type) {
		case "navigate":
			if (!state.cache.has(action.url)) {
				state.cache.set(
					action.url,
					createFromFetch(
						fetch(`/__rsc${action.url}`, {
							headers: {
								Accept: "text/x-component",
								"x-navigate": action.url,
							},
						}),
					),
				);
			}
			return { ...state, url: action.url };
		default:
			return state;
	}
}

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
	const initialState = useMemo(() => {
		let cache = new Map();
		cache.set(initialURL, children);
		return {
			url: initialURL,
			cache: cache,
		};
	}, [initialURL, children]);

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
			replace(url: string) {
				history.replace(url, state);
				startTransition(() => dispatch({ type: "navigate", url }));
			},
			history,
		};
	}, [dispatch]);

	let content = state.cache.get(state.url);

	return (
		<RouterContext.Provider value={router}>
			<RedirectBoundary>
				<LayoutRouter childNode={content} />
			</RedirectBoundary>
		</RouterContext.Provider>
	);
}

function LayoutRouter({ childNode }: { childNode: any }) {
	let resolvedContext = childNode?.then
		? use(childNode)
		: childNode ?? (null as any);
	return resolvedContext;
}
