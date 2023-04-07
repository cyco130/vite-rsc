"use client";

import { createContext } from "react";
import { RouterAPI } from "./router-api";

export const routerContext = /*#__PURE__*/ createContext<RouterAPI>({} as any);
