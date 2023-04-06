import * as page from "./browse";
import type { route as parentRoute } from "./(layout).types";
import { TypedRouteModule, TypedRouteOptions } from "rsc-router";

export type route = TypedRouteModule<parentRoute, "/browse", typeof page>;

export type PageProps = {
	params: route["__types"]["allParams"];
	searchParams: route["__types"]["fullSearchSchema"];
};

export type PageConfig = TypedRouteOptions<parentRoute, "/browse">;
