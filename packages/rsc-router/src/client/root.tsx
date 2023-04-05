import { createPath, createBrowserHistory } from "history";
import React, {
	useState,
	useMemo,
	startTransition,
	use,
	useEffect,
} from "react";
import { useRSCStream } from "./streams";
import { RouterAPI, RouterContext } from ".";

export function useRSCRouter() {
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
			history,
		} satisfies RouterAPI;
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

	return { ...router, url } as const;
}

function RSCElement({ url }: { url: string }) {
	return use(useRSCStream(url));
}

export function Root() {
	const router = useRSCRouter();

	return (
		<RouterContext.Provider value={router}>
			<RSCElement url={router.url} />
		</RouterContext.Provider>
	);
}
