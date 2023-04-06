import { TypedRouteModule, TypedRouteOptions, RouteWithChildren } from "rsc-router";
import { route as _playlistRoute } from "./[playlist].types";
import { route as _Route } from "./(home).types";
import * as layout from "./(layout)";
import { route as parentRoute } from "./../(layout).types";
import React from "react";

export type route = TypedRouteModule<parentRoute, "/:library", typeof layout>;

export type routeWithChildren = RouteWithChildren<
	route,
	[_playlistRoute, _Route]
>;

export type LayoutProps = {
	params: routeWithChildren["__types"]["allParams"];
	searchParams: routeWithChildren["__types"]["fullSearchSchema"];
	children: React.ReactNode;
};

export type LayoutConfig = TypedRouteOptions<parentRoute, "/:library">;
