import { createContext, useContext } from "react";
import { RouterAPI } from "../client/router/router-api";

export const RouterContext = createContext<RouterAPI>({} as RouterAPI);

export function useRouter() {
	return useContext(RouterContext);
}
