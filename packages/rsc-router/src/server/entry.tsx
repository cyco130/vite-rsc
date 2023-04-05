import { createModuleMapProxy, setupWebpackEnv } from "./webpack";
import { createHandler } from "./handler";
import Root from "~/root?rsc";

export function createReactServerHandler() {
	setupWebpackEnv();

	const clientModuleMap = createModuleMapProxy();

	return createHandler(Root, {
		clientModuleMap,
		clientEntry: "/node_modules/rsc-router/src/entry-client.ts",
	});
}
