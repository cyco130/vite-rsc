import type { RenderToReadableStreamOptions } from "react-dom/server.edge";
import type { Manifest } from "vite";
import type { RouteManifest } from "./router-types";

export type Env = {
	clientModuleMap: ModuleMap;
	components: { [key: string]: any };
	findAssets: () => Promise<Array<string | { type: string }>>;
	routesConfig: { [key: string]: any };
	manifests?: {
		buildAppRoot: string;
		srcAppRoot: string;
		clientManifest: Manifest;
		serverManifest: Manifest;
		reactServerManifest: Manifest;
		routesConfig: RouteManifest;
		findInServerManifest(chunk: string): string;
	};
	loadModule(id: string): Promise<any>;
} & RenderToReadableStreamOptions;
