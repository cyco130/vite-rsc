import { createServerRoutes } from "./server-routes";
import fs from "node:fs";
import path, { relative } from "node:path";
import { RouteManifest, stripFileExtension } from "./types";

function prettyPrintRoutes(routes: any, tabs = 0) {
	routes.forEach((r: any) => {
		const gap = Array.from({ length: tabs })
			.map(() => "  ")
			.join("");
		if (r.children) {
			prettyPrintRoutes(r.children, tabs + 1);
		}
	});
}

const rootLayoutTemplate = (
	paths: any[],
	names: any[],
	parent: any,
	path: any,
	fileName: any,
) => `
import { TypedRouter, TypedRootRoute, TypedRouteModule, TypedRouteOptions, RouteWithChildren } from "fully-react";
${paths
	.map(
		([c, bool], i) =>
			`import { ${bool ? "routeWithChildren" : "route"} as ${
				names[i]
			}Route } from "./${c}.types";`,
	)
	.join("\n")}
import * as layout from "./${fileName}";
import React from "react";

export type route = TypedRootRoute<typeof layout>;

export type routeWithChildren = RouteWithChildren<
	route,
	[${names.map((c) => `${c}Route`).join(", ")}]
>;

export type LayoutProps = {
	params: routeWithChildren["__types"]["allParams"];
	searchParams: routeWithChildren["__types"]["fullSearchSchema"];
	children: React.ReactNode;
};

export type LayoutConfig = TypedRouteOptions<RootRoute, "/">;

declare module "fully-react" {
	interface Register {
		router: TypedRouter<routeWithChildren>;
	}
}
`;

const layoutTemplate = (
	paths: any[],
	names: any,
	parent: any,
	path: any,
	fileName: any,
	parentFilename: any,
) => `import { TypedRouteModule, TypedRouteOptions, RouteWithChildren } from "fully-react";
${paths
	.map(
		([c, bool], i) =>
			`import { ${bool ? "routeWithChildren" : "route"} as ${
				names[i]
			}Route } from "./${c}.types";`,
	)
	.join("\n")}
import * as layout from "./${fileName}";
import { route as parentRoute } from "./${parentFilename}.types";
import React from "react";

export type route = TypedRouteModule<parentRoute, "${path}", typeof layout>;

export type routeWithChildren = RouteWithChildren<
	route,
	[${names.map((c) => `${c}Route`).join(", ")}]
>;

export type LayoutProps = {
	params: routeWithChildren["__types"]["allParams"];
	searchParams: routeWithChildren["__types"]["fullSearchSchema"];
	children: React.ReactNode;
};

export type LayoutConfig = TypedRouteOptions<parentRoute, "${path}">;
`;

const pageTemplate = (
	path: string,
	fileName: string,
	parentFileName: string,
) => `import * as page from "./${fileName}";
import type { route as parentRoute } from "./${parentFileName}.types";
import { TypedRouteModule, TypedRouteOptions } from "fully-react";

export type route = TypedRouteModule<parentRoute, "${path}", typeof page>;

export type PageProps = {
	params: route["__types"]["allParams"];
	searchParams: route["__types"]["fullSearchSchema"];
};

export type PageConfig = TypedRouteOptions<parentRoute, "${path}">;
`;

function generateTypeForRoute(
	route: any,
	rootDir: any,
	outDir: any,
	manifest: { [x: string]: { file: any; parentId: string } },
) {
	const routeMan = manifest[route.id];
	const typesPath = routeMan.file
		.replace(rootDir, outDir)
		.replace(".tsx", ".types.d.ts");

	if (!fs.existsSync(path.dirname(typesPath))) {
		fs.mkdirSync(path.dirname(typesPath), { recursive: true });
	}

	if (route.id === "") {
		if (route.children) {
			fs.writeFileSync(
				typesPath,
				rootLayoutTemplate(
					route.children.map((c) => [
						stripFileExtension(
							path.join(
								".",
								relative(path.dirname(routeMan.file), manifest[c.id].file),
							),
						),
						c.children ? true : false,
					]),
					route.children.map((c) =>
						(c.path ?? "/")
							.replaceAll("/", "_")
							.replaceAll("[", "_")
							.replaceAll("...", "___")
							.replaceAll("*", "___")
							.replaceAll(":", "_")
							.replaceAll("]", "_"),
					),
					route,
					route.path ?? "/",
					stripFileExtension(path.basename(routeMan.file)),
				),
			);
			route.children.forEach((r: any) => {
				generateTypeForRoute(r, rootDir, outDir, manifest);
			});
		}
	} else if (route.children) {
		fs.writeFileSync(
			typesPath,
			layoutTemplate(
				route.children.map((c) => [
					stripFileExtension(
						path.join(
							".",
							relative(path.dirname(routeMan.file), manifest[c.id].file),
						),
					),
					c.children ? true : false,
				]),
				route.children.map((c) =>
					(c.path ?? "/")
						.replaceAll("/", "_")
						.replaceAll("[", "_")
						.replaceAll(":", "_")
						.replaceAll("]", "_"),
				),
				route,
				route.path ?? "/",
				stripFileExtension(path.basename(routeMan.file)),
				stripFileExtension(
					path.join(
						".",
						relative(
							path.dirname(routeMan.file),
							manifest[routeMan.parentId].file,
						),
					),
				),
			),
		);
		route.children.forEach((r: any) => {
			generateTypeForRoute(r, rootDir, outDir, manifest);
		});
	} else if (route.index) {
		// fs.writeFileSync(
		// 	typesPath,
		// 	pageTemplate(
		// 		route.path,
		// 		path.basename(routeMan.file),
		// 		path.basename(manifest[routeMan.parentId].file),
		// 	),
		// );
		const parentFile = manifest[routeMan.parentId].file;
		const file = routeMan.file;
		fs.writeFileSync(
			typesPath,
			pageTemplate(
				route.path ?? "/",
				stripFileExtension(path.basename(routeMan.file)),
				stripFileExtension(
					path.join(".", relative(path.dirname(file), parentFile)),
				),
			),
		);
	} else {
		const parentFile = manifest[routeMan.parentId].file;
		const file = routeMan.file;
		fs.writeFileSync(
			typesPath,
			pageTemplate(
				route.path ?? "/",
				stripFileExtension(path.basename(routeMan.file)),
				stripFileExtension(
					path.join(".", relative(path.dirname(file), parentFile)),
				),
			),
		);
		// fs.writeFileSync(
		// 	typesPath,
		// 	pageTemplate(
		// 		route.path,
		// 		path.basename(routeMan.file),
		// 		path.basename(manifest[routeMan.parentId].file),
		// 	),
		// );
	}
}

function generateTypes(
	routes: any,
	rootDir: string,
	outDir: string,
	manifest: RouteManifest,
) {
	routes.forEach((r: any) => {
		generateTypeForRoute(r, rootDir, outDir, manifest);
	});
}

// export function createFileSystemRoutes(rootDir: string) {
// 	if (!fs.existsSync(rootDir) || !fs.existsSync(path.join(rootDir, "routes"))) {
// 		console.warn("No routes found");
// 		return [];
// 	}

// 	const routeManifest = defineFileSystemRoutes(rootDir, ["**/*.css"]);
// 	if (!fs.existsSync(".vite")) {
// 		fs.mkdirSync(".vite");
// 	}

// 	fs.writeFileSync(".vite/routes.json", JSON.stringify(routeManifest, null, 2));
// 	const routes = createServerRoutes(routeManifest, "root");
// 	prettyPrintRoutes(routes);
// 	generateTypes(
// 		routes,
// 		rootDir,
// 		rootDir.replace(/\/app$/, "/.vite/app"),
// 		routeManifest,
// 	);
// 	return routes;
// }
