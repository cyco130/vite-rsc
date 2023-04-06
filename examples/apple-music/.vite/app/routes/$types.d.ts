import {
	TypedRouter,
	Route,
	RootRoute,
	RouteWithChildren,
	TypedRouteOptions,
} from "rsc-router";
import { route as libraryRoute } from "./library/[library]/$types";
import { route as playlistRoute } from "./playlist/[playlist]/$types";
import { config } from "./(layout)";
import React from "react";

export type route = RootRoute<
	unknown,
	ReturnType<(typeof config)["validateSearch"]>
>;

type allRoutes = RouteWithChildren<route, [libraryRoute, playlistRoute]>;

export type LayoutProps = {
	params: allRoutes["__types"]["allParams"];
	searchParams: allRoutes["__types"]["fullSearchSchema"];
	children: React.ReactNode;
};

export type LayoutConfig = TypedRouteOptions<unknown, "/">;

declare module "rsc-router" {
	interface Register {
		router: TypedRouter<allRoutes>;
	}
}
