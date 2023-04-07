import { AnyRoute, Route } from "./route";
import { AnyRoutesInfo, DefaultRoutesInfo } from "./routeInfo";
import { AnyRouter, isRedirect, ParsedLocation, Router } from "./router";
import { replaceEqualDeep } from "./utils";

export interface RouteMatchState<
	TRoutesInfo extends AnyRoutesInfo = DefaultRoutesInfo,
	TRoute extends AnyRoute = Route,
> {
	routeSearch: TRoute["__types"]["searchSchema"];
	search: TRoutesInfo["fullSearchSchema"] &
		TRoute["__types"]["fullSearchSchema"];
	status: "idle" | "pending" | "success" | "error";
	error?: unknown;
	updatedAt: number;
	loader: TRoute["__types"]["loader"];
}

const componentTypes = [
	"component",
	"errorComponent",
	"pendingComponent",
] as const;

export interface PendingRouteMatchInfo {
	state: RouteMatchState<any, any>;
	routeContext: {};
	context: {};
}

export type AnyRouteMatch = RouteMatch<any, any>;

export class RouteMatch<
	TRoutesInfo extends AnyRoutesInfo = DefaultRoutesInfo,
	TRoute extends AnyRoute = AnyRoute,
> {
	route!: TRoute;
	router!: Router<TRoutesInfo["routeTree"], TRoutesInfo>;
	// __store!: Store<RouteMatchState<TRoutesInfo, TRoute>>;
	state!: RouteMatchState<TRoutesInfo, TRoute>;
	id!: string;
	pathname!: string;
	params!: TRoute["__types"]["allParams"];

	routeContext?: TRoute["__types"]["routeContext"];
	context!: TRoute["__types"]["context"];

	// component?: RouteComponent<{
	// 	useLoader: TRoute["useLoader"];
	// 	useMatch: TRoute["useMatch"];
	// 	useContext: TRoute["useContext"];
	// 	useSearch: TRoute["useSearch"];
	// }>;
	// errorComponent?: RouteComponent<{
	// 	error: Error;
	// 	info: { componentStack: string };
	// }>;
	// pendingComponent?: RouteComponent;
	abortController = new AbortController();
	parentMatch?: RouteMatch;
	pendingInfo?: PendingRouteMatchInfo;
}
