import { createRouter } from "../server/create-router";
import { createFileSystemRoutes, defineFileSystemRoutes } from "./dev";

const routesConfig = defineFileSystemRoutes(process.cwd() + "/app");
console.log(routesConfig);
const routes = createFileSystemRoutes(process.cwd() + "/app");
console.log(routes);
export default createRouter(routes);
