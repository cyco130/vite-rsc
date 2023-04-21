import { createRouter } from "../server/create-router";
import { createServerRoutes } from "vite-react-server/fs-router";
import { lazy } from "react";

const routes = createServerRoutes(
	{
		manifests: { routesConfig: globalThis.routesConfig },
		lazyComponent: (id: string) => {
			return lazy(() => __webpack_chunk_get__(id));
		},
	},

	"root",
);

console.log(routes, globalThis.routesConfig);

export default createRouter(routes);
