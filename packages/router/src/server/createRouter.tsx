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
import { PageProps } from "../types";

function renderMatches(
	matches: RouteMatch[],
	props: PageProps,
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

	function AppRouter(props: PageProps) {
		const basename = "/";
		const url = new URL(props.url);
		const location = createLocation("", createPath(url), null, "default");
		const matches = matchRoutes(dataRoutes, location, basename);

		let content;
		if (!matches) {
			const RootComponent = dataRoutes[0].component;
			content = (
				<RootComponent {...props} params={{}} children={<div>404</div>} />
			);
		} else {
			const params = matches.reduce((params, match) => {
				return { ...params, ...match.params };
			}, {});

			content = renderMatches(matches, {
				...props,
				params,
			});
		}

		const isClientNavigation = props.headers["x-navigate"];

		if (isClientNavigation) {
			return content;
		}

		return <Router initialURL={location.pathname}>{content}</Router>;
	}

	return AppRouter;
}
