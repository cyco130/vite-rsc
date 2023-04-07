"use client";

import { useContext } from "react";
import { routerContext } from "./context";

export function useRouter() {
	return useContext(routerContext);
}
