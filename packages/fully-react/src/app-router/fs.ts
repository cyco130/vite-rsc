import { createRouter } from "./server/create-router";
import { createServerRoutes } from "../fs-router/server-routes";

const routes = createServerRoutes(globalThis.env, "root");

export default createRouter(routes);
