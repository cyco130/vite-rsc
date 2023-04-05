import { useRSCClientRouter, RSCElement } from "./streams";
import { RouterContext } from ".";

export function Root() {
	const router = useRSCClientRouter();

	return (
		<RouterContext.Provider value={router}>
			<RSCElement url={router.url} />
		</RouterContext.Provider>
	);
}
