import { createReactServerHandler } from "rsc-router/server";
import { authOptions } from "../lib/auth";
import { handleAuthRequest } from "rsc-auth";

export default createReactServerHandler({
	apiRoutes: (router) => {
		router.get("/api/auth*", (context) => {
			return handleAuthRequest(context.request, "/api/auth", authOptions);
		});
		router.post("/api/auth*", (context) => {
			return handleAuthRequest(context.request, "/api/auth", authOptions);
		});
	},
});
