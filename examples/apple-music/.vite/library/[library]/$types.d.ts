import type { config } from "./page";
import type { route as parentRoute } from "../../$types";
import { TypedRoute, TypedRouteOptions } from "rsc-router";

export type route = TypedRoute<
	parentRoute,
	"library/:library/",
	ReturnType<(typeof config)["validateSearch"]>,
	ReturnType<(typeof config)["parseParams"]>
>;

export type PageProps = {
	params: route["__types"]["allParams"];
	searchParams: route["__types"]["fullSearchSchema"];
};

export type PageConfig = TypedRouteOptions<parentRoute, "library/:library">;
