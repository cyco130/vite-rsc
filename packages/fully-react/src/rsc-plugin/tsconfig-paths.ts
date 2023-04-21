import originalTsconfigPaths, { PluginOptions } from "vite-tsconfig-paths";
import { hasRscQuery, addRscQuery, removeRscQuery } from "./utils";

export type { PluginOptions };

export const tsconfigPaths: typeof originalTsconfigPaths = (options) => {
	const original = originalTsconfigPaths(options);

	return {
		...original,
		async resolveId(id, importer, options) {
			// eslint-disable-next-line @typescript-eslint/ban-types
			let resolved = await (original.resolveId as Function).call(
				this,
				id,
				importer,
				options,
			);

			if (!resolved) return resolved;

			if (typeof resolved === "string") resolved = { id: resolved };

			if (hasRscQuery(resolved.id) === hasRscQuery(id)) return resolved;

			if (hasRscQuery(resolved.id) && importer && !hasRscQuery(importer)) {
				return removeRscQuery(resolved.id);
			} else if (
				!hasRscQuery(resolved.id) &&
				importer &&
				hasRscQuery(importer)
			) {
				return addRscQuery(resolved.id);
			}

			return resolved;
		},
	};
};
