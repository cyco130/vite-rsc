import { createReactServerHandler } from "rsc-router/server";
import { authOptions } from "./auth";
import { AuthHandler } from "./auth/handler";

let authHandler = AuthHandler("/api/auth", authOptions);
export default createReactServerHandler({
	apiRoutes: (router) => {
		router.get("/api/auth*", (context) => {
			return authHandler(context.request);
		});
		router.post("/api/auth*", (context) => {
			return authHandler(context.request);
		});
	},
});
