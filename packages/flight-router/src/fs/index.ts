import { createRouter } from "../server/create-router";
import { createFileSystemRoutes } from "./dev";

const routes = createFileSystemRoutes(process.cwd() + "/app");
console.log(routes);
export default createRouter(routes);
