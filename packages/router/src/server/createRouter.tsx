import { RouterContext } from "@hattip/router";
import {
	RouteObject,
	convertRoutesToDataRoutes,
	matchRoutes,
	RouteManifest,
	RouteMatch,
} from "./utils";
import { createLocation, createPath } from "../path";
import Router from "../client/Router";
import React from "react";

function renderMatches(
	matches: RouteMatch[],
	props: {
		searchParams: Record<string, string>;
		params: Record<string, string>;
	},
): React.ReactElement | null {
	const renderedMatches = matches;

	return renderedMatches.reduceRight((outlet, match) => {
		const getChildren = () => {
			if (match.route.component) {
				return <match.route.component children={outlet} {...props} />;
			}

			return <div>404</div>;
		};
		return getChildren();
	}, null as React.ReactElement | null);
}

export function createRouter(routes: RouteObject[]) {
	const manifest: RouteManifest = {};
	const dataRoutes = convertRoutesToDataRoutes(
		routes,
		() => false,
		undefined,
		manifest,
	);

	function AppRouter(context: RouterContext) {
		const basename = "/";
		const location = createLocation(
			"",
			createPath(context.url),
			null,
			"default",
		);
		const matches = matchRoutes(dataRoutes, location, basename);

		if (!matches) {
			return <div>404</div>;
		}

		const params = matches.reduce((params, match) => {
			return { ...params, ...match.params };
		}, {});

		const renderedRoutes = renderMatches(matches, {
			params,
			searchParams: Object.fromEntries(context.url.searchParams.entries()),
		});

		const isRSCNavigation = context.request.headers.get("x-navigate");

		if (isRSCNavigation) {
			return renderedRoutes;
		}

		return <Router initialURL={context.url.pathname}>{renderedRoutes}</Router>;
	}

	return AppRouter;
}
