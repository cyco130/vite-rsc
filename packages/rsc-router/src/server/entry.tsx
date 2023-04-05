import { createModuleMapProxy, setupWebpackEnv } from "./webpack";
import { createServerRouter } from "./handler";
import Root from "~/root?rsc";
import { Router } from "@hattip/router";

export function createReactServerHandler({
	apiRoutes,
}: {
	apiRoutes?: (router: Router) => void;
}) {
	setupWebpackEnv();

	const clientModuleMap = createModuleMapProxy();

	return createServerRouter(Root, {
		clientModuleMap,
		clientEntry: "/app/entry-client",
		apiRoutes: apiRoutes ?? (() => {}),
	}).buildHandler();
}
