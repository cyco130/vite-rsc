import type { RouteManifest } from "./types";
import { lazy } from "react";

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
	manifest: RouteManifest,
	parentId = "",
	routesByParentId: Record<
		string,
		Omit<any, "children">[]
	> = groupRoutesByParentId(manifest),
) {
	return (routesByParentId[parentId] || [])
		.map((route) => {
			if (route.routeHandler) {
				return;
			}

			const dataRoute = {
				id: route.id,
				path: route.path,
				caseSensitive: route.caseSensitive,
				children: undefined as any,
				index: route.index,
				component: lazy(() => globalThis.__webpack_chunk_get__(route.file)),
				// Note: we don't need loader/action/shouldRevalidate on these routes
				// since they're for a static render
			};

			const children = createServerRoutes(manifest, route.id, routesByParentId);
			if (children.length > 0) dataRoute.children = children;
			return dataRoute;
		})
		.filter(Boolean);
}
