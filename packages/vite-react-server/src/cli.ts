import { readFileSync } from "fs";
import { removeDir, writeJson } from "./fs";
import { copyDependenciesToFunction } from "./nft";
import { pathToFileURL } from "url";
import { join, relative } from "path";
import { Manifest } from "vite";

async function adapt() {
	const buildTempFolder = pathToFileURL(process.cwd() + "/");
	const outDir = new URL(".vercel/output/", buildTempFolder);
	const serverEntry = new URL("dist/server/index.js", buildTempFolder);
	const functionFolder = new URL(
		".vercel/output/functions/render.func/",
		buildTempFolder,
	);
	// const inc = includeFiles?.map((file) => new URL(file, _config.root)) || [];
	// if (_config.vite.assetsInclude) {
	// 	const mergeGlobbedIncludes = (globPattern: unknown) => {
	// 		if (typeof globPattern === "string") {
	// 			const entries = glob.sync(globPattern).map((p) => pathToFileURL(p));
	// 			inc.push(...entries);
	// 		} else if (Array.isArray(globPattern)) {
	// 			for (const pattern of globPattern) {
	// 				mergeGlobbedIncludes(pattern);
	// 			}
	// 		}
	// 	};

	// 	mergeGlobbedIncludes(_config.vite.assetsInclude);
	// }

	const serverManifest: Manifest = JSON.parse(
		readFileSync("dist/server/manifest.json", "utf-8"),
	);
	const serverClientManifest: string[] = JSON.parse(
		readFileSync("dist/server/react-server/client-manifest.json", "utf-8"),
	);
	const serverServerManifest: string[] = JSON.parse(
		readFileSync("dist/server/react-server/server-manifest.json", "utf-8"),
	);

	const entries: URL[] = [];
	serverServerManifest.forEach((s) => {
		console.log(s, serverManifest[relative(process.cwd(), s)]);
		entries.push(
			new URL(
				`./` + serverManifest[relative(process.cwd(), s)].file,
				serverEntry,
			),
		);
	});
	serverClientManifest.forEach((s) => {
		console.log(s, serverManifest[relative(process.cwd(), s)]);
		entries.push(
			new URL(
				`./` + serverManifest[relative(process.cwd(), s)].file,
				serverEntry,
			),
		);
	});

	// Remove previous output folder
	await removeDir(outDir);

	// Copy necessary files (e.g. node_modules/)
	const { handler } = await copyDependenciesToFunction({
		entries: [
			serverEntry,
			new URL("dist/server/react-server/react-server.js", buildTempFolder),
			...entries,
		],
		outDir: functionFolder,
		// includeFiles: inc,
		includeFiles: [],
		excludeFiles: [],
		// excludeFiles:
		// 	excludeFiles?.map((file) => new URL(file, _config.root)) || [],
	});

	const root = handler.replace("dist/server/index.js", "");

	// Enable ESM
	// https://aws.amazon.com/blogs/compute/using-node-js-es-modules-and-top-level-await-in-aws-lambda/
	await writeJson(new URL(`package.json`, functionFolder), {
		type: "module",
	});

	// Serverless function config
	// https://vercel.com/docs/build-output-api/v3#vercel-primitives/serverless-functions/configuration
	await writeJson(new URL(`.vc-config.json`, functionFolder), {
		runtime: getRuntime(),
		handler,
		environment: {
			OUT_ROOT_DIR: root,
		},
		launcherType: "Nodejs",
	});

	await writeJson(
		new URL(root + "dist/server/static-manifest.json", functionFolder),
		JSON.parse(readFileSync("dist/static/manifest.json", "utf-8")),
	);

	await writeJson(
		new URL(root + "dist/server/manifest.json", functionFolder),
		JSON.parse(readFileSync("dist/server/manifest.json", "utf-8")),
	);

	// Output configuration
	// https://vercel.com/docs/build-output-api/v3#build-output-configuration
	await writeJson(new URL(`config.json`, outDir), {
		version: 3,
		routes: [
			// ...getRedirects(routes, _config),
			{ handle: "filesystem" },
			{ src: "/.*", dest: "render" },
		],
	});
}

function getRuntime() {
	const version = process.version.slice(1); // 'v16.5.0' --> '16.5.0'
	const major = version.split(".")[0]; // '16.5.0' --> '16'
	return `nodejs${major}.x`;
}

adapt();
