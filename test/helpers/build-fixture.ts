import { test } from "@playwright/test";
import { sync as spawnSync } from "cross-spawn";
import fse from "fs-extra";
import path from "path";
import stripIndent from "strip-indent";
import { fileURLToPath } from "url";
import { TMP_DIR } from "./create-server.js";
import type { FixtureInit } from "./create-server.js";
////////////////////////////////////////////////////////////////////////////////

export async function buildFixture(init: FixtureInit): Promise<string> {
	let template = "template";
	let dirname = path.dirname(
		path.dirname(path.join(fileURLToPath(import.meta.url))),
	);
	let info = test.info();
	let pName = info.titlePath
		.slice(1, info.titlePath.length - 1)
		.map((s) => s.replace(/ /g, "-"))
		.join("-");
	let integrationTemplateDir = path.join(dirname, template);
	let projectName = `${pName}-${Math.random().toString(32).slice(2)}`;
	let projectDir = path.join(TMP_DIR, projectName);

	await fse.ensureDir(projectDir);
	await fse.copy(integrationTemplateDir, projectDir);

	// if (init.setup) {
	//   spawnSync("node", ["node_modules/@remix-run/dev/cli.js", "setup", init.setup], {
	//     cwd: projectDir
	//   });
	// }
	await writeTestFiles(init, projectDir);
	await build(projectDir, init.buildStdio);

	return projectDir;
}
function build(
	projectDir: string,
	buildStdio?: boolean,
	adapter: string | undefined = process.env.START_ADAPTER,
) {
	let proc = spawnSync("npm", ["run", "build"], {
		cwd: projectDir,
		env: {
			...process.env,
		},
	});

	if (proc.error) {
		console.error(proc.error);
	}

	if (buildStdio) {
		console.log(proc.stdout.toString());
	}
	console.error(proc.stderr.toString());
}

async function writeTestFiles(init: FixtureInit, dir: string) {
	await Promise.all(
		Object.keys(init.files).map(async (filename) => {
			let filePath = path.join(dir, filename);
			await fse.ensureDir(path.dirname(filePath));
			await fse.writeFile(filePath, stripIndent(init.files[filename]));
		}),
	);
}
