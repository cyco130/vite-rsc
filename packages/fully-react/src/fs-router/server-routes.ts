import { Env } from "../env";
import type { RouteManifest } from "./types";
import { RouteObject } from "./utils";

// Create a map of routes by parentId to use recursively instead of
// repeatedly filtering the manifest.
export function groupRoutesByParentId(manifest: RouteManifest) {
	const routes: Record<string, Omit<any, "children">[]> = {};

	Object.values(manifest).forEach((route) => {
		const parentId = route.parentId || "";
		if (!routes[parentId]) {
			routes[parentId] = [];
		}
		routes[parentId].push(route);
	});

	return routes;
}

export function createServerRoutes(
	env: Env,
	parentId = "",
	routesByParentId: Record<
		string,
		Omit<any, "children">[]
	> = groupRoutesByParentId(env.manifests?.routesConfig || {}),
): RouteObject[] {
	return (routesByParentId[parentId] || [])
		.map((route) => {
			if (route.routeHandler) {
				return undefined as unknown as RouteObject;
			}

			const dataRoute = {
				id: route.id,
				path: route.path,
				caseSensitive: route.caseSensitive,
				children: undefined as any,
				index: route.index,
				component: env.lazyComponent(route.file),
			} satisfies RouteObject;

			const children = createServerRoutes(env, route.id, routesByParentId);
			if (children.length > 0) dataRoute.children = children;
			return dataRoute;
		})
		.filter(Boolean);
}
