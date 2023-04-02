import { RouterContext } from "@hattip/router";
import {
	RouteObject,
	convertRoutesToDataRoutes,
	matchRoutes,
	RouteManifest,
	RouteMatch,
} from "./utils";
import { createLocation, createPath } from "../path";

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
			// let children: React.ReactNode = outlet;
			// if (error) {
			// children = errorElement;
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

	function Router(context: RouterContext) {
		let basename = "/";
		let location = createLocation("", createPath(context.url), null, "default");
		let matches = matchRoutes(dataRoutes, location, basename);
		console.log(matches);

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

		return renderedRoutes;
	}

	return Router;
}
