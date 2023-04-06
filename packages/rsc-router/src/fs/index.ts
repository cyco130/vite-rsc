import { defineFileSystemRoutes } from "./router";
import { createServerRoutes } from "./createServerRoutes";
import fs from "node:fs";
export * from "./route";
export * from "./router";

function prettyPrintRoutes(routes: any, tabs = 0) {
	routes.forEach((r: any) => {
		const gap = Array.from({ length: tabs })
			.map(() => "  ")
			.join("");
		console.log(gap, r.path ?? "/");
		if (r.children) {
			prettyPrintRoutes(r.children, tabs + 1);
		}
	});
}

function generateTypes(routes: any, rootDir, outDir) {
	console.log(outDir);
	// if (fs.existsSync(outDir)) {
	// 	fs.rmSync(outDir, { recursive: true });
	// }
}

export function createFileSystemRoutes(rootDir: string) {
	const routeManifest = defineFileSystemRoutes(rootDir, ["**/*.css"]);
	if (!fs.existsSync(".vite")) {
		fs.mkdirSync(".vite");
	}

	fs.writeFileSync(".vite/routes.json", JSON.stringify(routeManifest, null, 2));
	const routes = createServerRoutes(routeManifest, "root");
	prettyPrintRoutes(routes);
	generateTypes(routes, rootDir, rootDir.replace("/app/", "/.vite/app/"));
	return routes;
}
