import { RouteOptions as RouteOptionsBase } from "./router/types";

export { A } from "./router/A";
export * from "./router/useRouter";
export { default as Router } from "./router/Router";
export * from "./router/Router";
export * from "./router/useMutation";
export * from "./router/ErrorBoundary";
export * from "./router/Form";
export * from "./router/redirect";
export * from "./streams";
export type { PageProps } from "../types";

export type {
	Register,
	Route,
	Router as TypedRouter,
	TypedRoute,
	RootRoute,
	RouteWithChildren,
	TypedRouteOptions,
} from "./router/types";
