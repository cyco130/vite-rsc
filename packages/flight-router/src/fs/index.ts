import { createRouter } from "../server/create-router";
import { createServerRoutes } from "./server-routes";

export default createRouter(
	createServerRoutes(globalThis.routesConfig, "root"),
);
