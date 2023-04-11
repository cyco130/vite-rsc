import {
	RouteObject,
	convertRoutesToDataRoutes,
	matchRoutes,
	RouteManifest,
	RouteMatch,
} from "../client/router/utils";
import { createLocation, createPath } from "../path";
import Router, { LayoutRouter } from "../client/router/Router";
import React, { useLayoutEffect } from "react";
import { PageProps } from "../types";
import { Assets } from "stream-react/assets";
import { StatusCode } from "./StatusCode";
import { NotFoundBoundary } from "../client/NotFoundBoundary";

function renderMatches(
	matches: RouteMatch[],
	props: PageProps,
): React.ReactElement | null {
	const renderedMatches = matches;

	return renderedMatches.reduceRight((outlet, match) => {
		const getChildren = () => {
			if (match.route.component) {
				return (
					<LayoutRouter
						segment={match.pathname}
						child={<match.route.component children={outlet} {...props} />}
					/>
				);
			}

			return <div>404</div>;
		};
		return getChildren();
	}, null as React.ReactElement | null);
}

function DefaultErrorComponent() {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<Assets />
				{import.meta.env.SSR ? <StatusCode code={404} /> : null}
			</head>
			<body>
				<div>404</div>
			</body>
		</html>
	);
}

export function createRouter(
	routes: RouteObject[],
	{
		errorComponent = DefaultErrorComponent,
		notFoundComponent = DefaultErrorComponent,
	} = {},
) {
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

		const NotFound = dataRoutes[0]?.component ?? notFoundComponent;
		const notFound = (
			<NotFound {...props} params={{}} children={<div>404</div>} />
		);
		let content = notFound;

		console.log(matches);

		if (matches) {
			const params = matches.reduce((params, match) => {
				return { ...params, ...match.params };
			}, {});

			content = renderMatches(matches, {
				...props,
				params,
			});
		}

		const isClientNavigation =
			props.headers["x-navigate"] || props.headers["x-mutation"];

		if (isClientNavigation) {
			return content;
		}

		return (
			<Router initialURL={location.pathname} notFound={notFound}>
				{content}
			</Router>
		);
	}

	return AppRouter;
}
