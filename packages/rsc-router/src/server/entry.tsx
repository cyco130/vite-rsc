import { createModuleMapProxy, setupWebpackEnv } from "./webpack";
import { createHandler } from "./handler";
import Root from "~/root?rsc";
import path from "node:path";
export function createReactServerHandler() {
	setupWebpackEnv();

	const clientModuleMap = createModuleMapProxy();

	return createHandler(Root, {
		clientModuleMap,
		clientEntry: "/app/entry-client",
	});
}
