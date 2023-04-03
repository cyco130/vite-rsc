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
		searchParams: URLSearchParams;
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

		let content;
		if (!matches) {
			const RootComponent = dataRoutes[0].component;
			content = (
				<RootComponent
					children={<div>404</div>}
					searchParams={context.url.searchParams}
				/>
			);
		} else {
			const params = matches.reduce((params, match) => {
				return { ...params, ...match.params };
			}, {});

			content = renderMatches(matches, {
				searchParams: context.url.searchParams,
				params,
			});
		}

		const isRSCNavigation = context.request.headers.get("x-navigate");

		if (isRSCNavigation) {
			return content;
		}

		return <Router initialURL={context.url.pathname}>{content}</Router>;
	}

	return AppRouter;
}
