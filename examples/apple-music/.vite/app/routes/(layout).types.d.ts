
import { TypedRouter, TypedRootRoute, TypedRouteModule, TypedRouteOptions, RouteWithChildren } from "rsc-router";
import { routeWithChildren as __playlistRoute } from "./[playlist]/(layout).types";
import { routeWithChildren as __libraryRoute } from "./[library]/(layout).types";
import { route as _browseRoute } from "./browse.types";
import { route as _Route } from "./page.types";
import * as layout from "./(layout)";
import React from "react";

export type route = TypedRootRoute<typeof layout>;

export type routeWithChildren = RouteWithChildren<
	route,
	[__playlistRoute, __libraryRoute, _browseRoute, _Route]
>;

export type LayoutProps = {
	params: routeWithChildren["__types"]["allParams"];
	searchParams: routeWithChildren["__types"]["fullSearchSchema"];
	children: React.ReactNode;
};

export type LayoutConfig = TypedRouteOptions<parentRoute, "/">;

declare module "rsc-router" {
	interface Register {
		router: TypedRouter<routeWithChildren>;
	}
}
