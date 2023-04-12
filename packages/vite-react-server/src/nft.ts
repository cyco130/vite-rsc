import { nodeFileTrace } from "@vercel/nft";
import { relative as relativePath } from "node:path";
import { fileURLToPath } from "node:url";

import { copyFilesToFunction } from "./fs.js";

export async function copyDependenciesToFunction({
	entries,
	outDir,
	includeFiles,
	excludeFiles,
}: {
	entries: URL[];
	outDir: URL;
	includeFiles: URL[];
	excludeFiles: URL[];
}): Promise<{ handler: string }> {
	const entry = entries[0];
	const entryPath = fileURLToPath(entry);

	// Get root of folder of the system (like C:\ on Windows or / on Linux)
	let base = entry;
	while (fileURLToPath(base) !== fileURLToPath(new URL("../", base))) {
		base = new URL("../", base);
	}

	const result = await nodeFileTrace(
		entries.map((e) => fileURLToPath(e)),
		{
			base: fileURLToPath(base),
		},
	);

	for (const error of result.warnings) {
		if (error.message.startsWith("Failed to resolve dependency")) {
			const [, module, file] =
				/Cannot find module '(.+?)' loaded from (.+)/.exec(error.message)!;

			// The import(astroRemark) sometimes fails to resolve, but it's not a problem
			if (module === "@astrojs/") continue;

			if (entryPath === file) {
				console.warn(
					`[@astrojs/vercel] The module "${module}" couldn't be resolved. This may not be a problem, but it's worth checking.`,
				);
			} else {
				console.warn(
					`[@astrojs/vercel] The module "${module}" inside the file "${file}" couldn't be resolved. This may not be a problem, but it's worth checking.`,
				);
			}
		}
		// parse errors are likely not js and can safely be ignored,
		// such as this html file in "main" meant for nw instead of node:
		// https://github.com/vercel/nft/issues/311
		else if (error.message.startsWith("Failed to parse")) {
			continue;
		} else {
			throw error;
		}
	}

	const commonAncestor = await copyFilesToFunction(
		[...result.fileList]
			.map((file) => new URL(file, base))
			.concat(includeFiles),
		outDir,
		excludeFiles,
	);

	return {
		// serverEntry location inside the outDir
		handler: relativePath(commonAncestor, entryPath),
	};
}
