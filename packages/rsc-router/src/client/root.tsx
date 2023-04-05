import { useRSCClientRouter, RSCElement } from "./streams";
import { RouterContext } from ".";
import React from "react";

export function Root() {
	const router = useRSCClientRouter();

	return (
		<RouterContext.Provider value={router}>
			<RSCElement url={router.url} />
		</RouterContext.Provider>
	);
}
