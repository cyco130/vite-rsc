import type { RouteManifest } from "./route";
import { lazy } from "react";
import { groupRoutesByParentId } from "./router";

export function createServerRoutes(
	manifest: RouteManifest,
	parentId = "",
	routesByParentId: Record<
		string,
		Omit<any, "children">[]
	> = groupRoutesByParentId(manifest),
) {
	return (routesByParentId[parentId] || []).map((route) => {
		const dataRoute = {
			id: route.id,
			path: route.path,
			caseSensitive: route.caseSensitive,
			children: undefined as any,
			index: route.index,
			component: lazy(() => __webpack_chunk_get__(route.file)),
			// Note: we don't need loader/action/shouldRevalidate on these routes
			// since they're for a static render
		};

		const children = createServerRoutes(manifest, route.id, routesByParentId);
		if (children.length > 0) dataRoute.children = children;
		return dataRoute;
	});
}
