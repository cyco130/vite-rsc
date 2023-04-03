import { createContext, use } from "react";

export interface RouterAPI {
	push: (path: string, state?: any) => void;
	replace: (path: string, state?: any) => void;
}

export const RouterContext = createContext<RouterAPI>({} as RouterAPI);

export function useRouter() {
	return use(RouterContext);
}
