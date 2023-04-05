import { History } from "history";
import { createContext, use, useContext } from "react";

export interface RouterAPI {
	push: (path: string, state?: any) => void;
	replace: (path: string, state?: any) => void;
	history: History;
}

export const RouterContext = createContext<RouterAPI>({} as RouterAPI);

export function useRouter() {
	return useContext(RouterContext);
}
