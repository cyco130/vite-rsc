import { createPath, createBrowserHistory } from "history";
import React, { useState, useMemo, startTransition, use } from "react";
import { useRSCStream } from "./streams";
import { RouterAPI, RouterContext } from ".";

export function useRSCRoot() {
	const [url, setURL] = useState(() => createPath(new URL(location.href)));
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
		} satisfies RouterAPI;
	}, [setURL]);

	const element = use(useRSCStream(url));

	return [router, element] as const;
}

export function Root() {
	const [router, element] = useRSCRoot();

	return (
		<RouterContext.Provider value={router}>{element}</RouterContext.Provider>
	);
}
