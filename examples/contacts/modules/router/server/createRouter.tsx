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
import { RedirectErrorBoundary } from "../client/RedirectBoundary";

function renderMatches(
	matches: RouteMatch[],
	props: {
		searchParams: Record<string, string>;
		params: Record<string, string>;
	},
): React.ReactElement | null {
	let renderedMatches = matches;

	return renderedMatches.reduceRight((outlet, match, index) => {
		let getChildren = () => {
			if (match.route.component) {
				return <match.route.component children={outlet} {...props} />;
			}

			return <div>404</div>;
		};
		return getChildren();
	}, null as React.ReactElement | null);
}

export function createRouter(routes: RouteObject[]) {
	let manifest: RouteManifest = {};
	let dataRoutes = convertRoutesToDataRoutes(
		routes,
		() => false,
		undefined,
		manifest,
	);

	function AppRouter(context: RouterContext) {
		let basename = "/";
		let location = createLocation("", createPath(context.url), null, "default");
		let matches = matchRoutes(dataRoutes, location, basename);

		if (!matches) {
			return <div>404</div>;
		}

		let params = matches.reduce((params, match) => {
			return { ...params, ...match.params };
		}, {});

		const renderedRoutes = renderMatches(matches, {
			params,
			searchParams: Object.fromEntries(context.url.searchParams.entries()),
		});

		let isRSCNavigation = context.request.headers.get("x-navigate");

		if (isRSCNavigation) {
			return renderedRoutes;
		}

		return <Router initialURL={context.url.pathname}>{renderedRoutes}</Router>;
	}

	return AppRouter;
}
