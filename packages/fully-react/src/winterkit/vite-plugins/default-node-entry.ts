import { Plugin } from "vite";
import { findServerEntry } from "./inject-config";

interface DevEntryOptions {
	hattipEntry: string;
	devEntry: (hattipEntry: string) => string;
}

export function devEntry(options: DevEntryOptions): Plugin {
	let root: string;
	const hattipEntry = options.hattipEntry;

	return {
		name: "hattip:dev-entry",

		enforce: "pre",

		config(config) {
			root = config.root ?? process.cwd();
		},

		async resolveId(source, importer, options) {
			if (!options.ssr || source !== "virtual:hattip:dev-entry") {
				return;
			}

			// const entry = await findServerEntry(root, true);
			// if (entry) {
			// 	const resolved = await this.resolve(entry, importer, {
			// 		...options,
			// 		skipSelf: true,
			// 	});

			// 	if (resolved) return resolved;
			// }

			// hattipEntry = hattipEntry

			return "virtual:hattip:dev-entry";
		},

		async load(id) {
			if (id === "virtual:hattip:dev-entry") {
				if (typeof options.devEntry === "string") {
					return options.devEntry;
				} else {
					return options.devEntry(hattipEntry!);
				}
			}
		},
	};
}
