import { PluginOption, UserConfig } from "vite";

import connect from "./vite-plugins/connect";
import { devEntry } from "./vite-plugins/default-node-entry";
import { exposeDevServer } from "./expose-dev-server";
import { injectConfig } from "./vite-plugins/inject-config";

interface HattipOptions {
	hattipEntry: string;
	nodeEntry?: string;
	devEntry: (devServer: any) => string;
	extraServerEntries?: string | string[] | Record<string, string>;
	clientEntries?: boolean | string | string[] | Record<string, string>;
	clientConfig?: UserConfig;
	serverConfig?: UserConfig;
	bundler?: string | { name: string; default(): Promise<void> };
}

export function hattip(options: HattipOptions): PluginOption {
	const hasClient = !!(options.clientConfig || options.clientEntries);

	return [
		exposeDevServer(),
		injectConfig(options),
		devEntry({
			hattipEntry: options.hattipEntry,
			devEntry: options.devEntry,
		}),
		connect(),
	];
}
