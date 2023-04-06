import { RootRoute, Route } from "rsc-router";

export type route = Route<RootRoute, "playlist/:playlist">;

export type PageProps = {
	params: route["__types"]["allParams"];
	searchParams: route["__types"]["fullSearchSchema"];
};
