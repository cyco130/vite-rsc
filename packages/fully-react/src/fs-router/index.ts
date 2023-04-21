import * as fs from "node:fs";
import * as path from "node:path";

import { ConfigRoute, RouteManifest } from "./types";

import { minimatch } from "minimatch";

export interface DefineRouteOptions {
	/**
	 * Should be `true` if the route `path` is case-sensitive. Defaults to
	 * `false`.
	 */
	caseSensitive?: boolean;

	/**
	 * Should be `true` if this is an index route that does not allow child routes.
	 */
	index?: boolean;

	/**
	 * An optional unique id string for this route. Use this if you need to aggregate
	 * two or more routes with the same route file.
	 */
	id?: string;

	routeHandler?: boolean;
}

interface DefineRouteChildren {
	(): void;
}

/**
 * A function for defining a route that is passed as the argument to the
 * `defineRoutes` callback.
 *
 * Calls to this function are designed to be nested, using the `children`
 * callback argument.
 *
 *   defineRoutes(route => {
 *     route('/', 'pages/layout', () => {
 *       route('react-router', 'pages/react-router');
 *       route('reach-ui', 'pages/reach-ui');
 *     });
 *   });
 */
export interface DefineRouteFunction {
	(
		/**
		 * The path this route uses to match the URL pathname.
		 */
		path: string | undefined,

		/**
		 * The path to the file that exports the React component rendered by this
		 * route as its default export, relative to the `app` directory.
		 */
		file: string,

		id: string,

		/**
		 * Options for defining routes, or a function for defining child routes.
		 */
		optionsOrChildren?: DefineRouteOptions | DefineRouteChildren,

		/**
		 * A function for defining child routes.
		 */
		children?: DefineRouteChildren,
	): void;
}

export type DefineRoutesFunction = typeof defineRoutes;

/**
 * A function for defining routes programmatically, instead of using the
 * filesystem convention.
 */
export function defineRoutes(
	callback: (defineRoute: DefineRouteFunction) => void,
): RouteManifest {
	const routes: RouteManifest = Object.create(null);
	const parentRoutes: ConfigRoute[] = [];
	let alreadyReturned = false;

	const defineRoute: DefineRouteFunction = (
		path,
		file,
		id,
		optionsOrChildren,
		children,
	) => {
		if (alreadyReturned) {
			throw new Error(
				"You tried to define routes asynchronously but started defining " +
					"routes before the async work was done. Please await all async " +
					"data before calling `defineRoutes()`",
			);
		}

		let options: DefineRouteOptions;
		if (typeof optionsOrChildren === "function") {
			// route(path, file, children)
			options = {};
			children = optionsOrChildren;
		} else {
			// route(path, file, options, children)
			// route(path, file, options)
			options = optionsOrChildren || {};
		}

		const route: ConfigRoute = {
			path: path ? path : undefined,
			index: options.index ? true : undefined,
			caseSensitive: options.caseSensitive ? true : undefined,
			id: id ?? createRouteId(file),
			parentId:
				parentRoutes.length > 0
					? parentRoutes[parentRoutes.length - 1].id
					: "root",
			routeHandler: options.routeHandler ? true : undefined,
			file,
		};

		if (route.id in routes) {
			throw new Error(
				`Unable to define routes with duplicate route id: "${route.id}"`,
			);
		}

		routes[route.id] = route;

		if (children) {
			parentRoutes.push(route);
			children();
			parentRoutes.pop();
		}
	};

	callback(defineRoute);

	alreadyReturned = true;

	return routes;
}

export function createRouteId(file: string) {
	file = file
		.replace("/page", "/")
		.replace("/route", "")
		.replace("/layout", "");
	return normalizeSlashes(stripFileExtension(file));
}

export function normalizeSlashes(file: string) {
	return file.split(path.win32.sep).join("/");
}

export function stripFileExtension(file: string) {
	return file.replace(/\.[a-z0-9]+$/i, "");
}

// /**
//  *
//  * @param {string} id
//  * @param {boolean} removePathlessLayouts
//  * @returns
//  */
// export function toPath(id, removePathlessLayouts = true) {
// 	const idWithoutIndex = id.endsWith("/index")
// 		? id.slice(0, -"index".length)
// 		: id;
// 	return (
// 		removePathlessLayouts
// 			? idWithoutIndex.replace(/\/\([^)/]+\)/g, "")
// 			: idWithoutIndex
// 	).replace(/\[([^\[]+)\]/g, (_, m) =>
// 		m.startsWith("...") ? `*${m.slice(3)}` : `:${m}`,
// 	);
// }

export const routeModuleExts = [".js", ".jsx", ".ts", ".tsx", ".md", ".mdx"];

export function isRouteModuleFile(filename: string): boolean {
	return routeModuleExts.includes(path.extname(filename));
}

export function toPath(id: string, removePathlessLayouts = true) {
	const idWithoutIndex = id.endsWith("/page")
		? id.slice(0, -"page".length)
		: id;

	const idWithoutRoute = idWithoutIndex.endsWith("/route")
		? idWithoutIndex.slice(0, -"/route".length)
		: idWithoutIndex;

	const idWithoutLayout = idWithoutRoute.endsWith("/layout")
		? idWithoutRoute.slice(0, -"/layout".length)
		: idWithoutRoute;
	return (
		removePathlessLayouts
			? idWithoutLayout.replace(/\([^)/]+\)/g, "")
			: idWithoutLayout
	).replace(/\[([^\[]+)\]/g, (_, m) => (m.startsWith("...") ? `*` : `:${m}`));
}

/**
 * Defines routes using the filesystem convention in `app/routes`. The rules are:
 *
 * - Route paths are derived from the file path. A `.` in the filename indicates
 *   a `/` in the URL (a "nested" URL, but no route nesting). A `$` in the
 *   filename indicates a dynamic URL segment.
 * - Subdirectories are used for nested routes.
 *
 * For example, a file named `app/routes/gists/$username.tsx` creates a route
 * with a path of `gists/:username`.
 */
export function defineFileSystemRoutes(
	appDir: string,
	ignoredFilePatterns: string[] = ["**/*.css"],
): RouteManifest {
	const files: { [routeId: string]: string } = {};

	const routesDir = path.join(appDir, "routes");
	// First, find all route modules in app/routes
	visitFiles(path.join(appDir, "routes"), (file) => {
		if (
			ignoredFilePatterns &&
			ignoredFilePatterns.some((pattern) => minimatch(file, pattern))
		) {
			return;
		}

		if (isRouteModuleFile(file)) {
			const routeId = createRouteId(`/` + file);
			files[routeId] = path.join(routesDir, file);
			return;
		}

		throw new Error(`Invalid route module file: ${path.join(routesDir, file)}`);
	});

	const routeIds = Object.keys(files).sort(byLongestFirst);
	const parentRouteIds = getParentRouteIds(routeIds);

	const uniqueRoutes = new Map<string, string>();

	// Then, recurse through all routes using the public defineRoutes() API
	function defineNestedRoutes(
		defineRoute: DefineRouteFunction,
		parentId?: string,
	): void {
		const childRouteIds = routeIds.filter(
			(id) => parentRouteIds[id] === parentId,
		);

		for (const routeId of childRouteIds) {
			const routePath: string | undefined = createRoutePath(
				routeId.slice(parentId ? parentId.length + 1 : 0),
			);

			const isRouteHandler = stripFileExtension(files[routeId]).endsWith(
				"/route",
			);
			const isIndexRoute = routeId.endsWith("/") || isRouteHandler;
			const fullPath = createRoutePath(routeId);
			const uniqueRouteId = (fullPath || "") + (isIndexRoute ? "?index" : "");

			if (uniqueRouteId) {
				if (uniqueRoutes.has(uniqueRouteId)) {
					throw new Error(
						`Path ${JSON.stringify(fullPath)} defined by route ${JSON.stringify(
							routeId,
						)} conflicts with route ${JSON.stringify(
							uniqueRoutes.get(uniqueRouteId),
						)}`,
					);
				} else {
					uniqueRoutes.set(uniqueRouteId, routeId);
				}
			}

			if (isIndexRoute) {
				const invalidChildRoutes = routeIds.filter(
					(id) => parentRouteIds[id] === routeId,
				);

				if (invalidChildRoutes.length > 0) {
					throw new Error(
						`Child routes are not allowed in index routes. Please remove child routes of ${routeId}`,
					);
				}

				defineRoute(routePath, files[routeId], routeId, {
					index: true,
					routeHandler: isRouteHandler,
				});
			} else {
				defineRoute(routePath, files[routeId], routeId, () => {
					defineNestedRoutes(defineRoute, routeId);
				});
			}
		}
	}

	return defineRoutes(defineNestedRoutes);
}

export const paramPrefixChar = "$" as const;
export const escapeStart = "[" as const;
export const escapeEnd = "]" as const;

export const optionalStart = "(" as const;
export const optionalEnd = ")" as const;

// TODO: Cleanup and write some tests for this function
export function createRemixRoutePath(
	partialRouteId: string,
): string | undefined {
	let result = "";
	let rawSegmentBuffer = "";

	let inEscapeSequence = 0;
	let inOptionalSegment = 0;
	let optionalSegmentIndex = null;
	let skipSegment = false;
	for (let i = 0; i < partialRouteId.length; i++) {
		const char = partialRouteId.charAt(i);
		const prevChar = i > 0 ? partialRouteId.charAt(i - 1) : undefined;
		const nextChar =
			i < partialRouteId.length - 1 ? partialRouteId.charAt(i + 1) : undefined;

		function isNewEscapeSequence() {
			return (
				!inEscapeSequence && char === escapeStart && prevChar !== escapeStart
			);
		}

		function isCloseEscapeSequence() {
			return inEscapeSequence && char === escapeEnd && nextChar !== escapeEnd;
		}

		function isStartOfLayoutSegment() {
			return char === "_" && nextChar === "_" && !rawSegmentBuffer;
		}

		function isNewOptionalSegment() {
			return (
				char === optionalStart &&
				prevChar !== optionalStart &&
				(isSegmentSeparator(prevChar) || prevChar === undefined) &&
				!inOptionalSegment &&
				!inEscapeSequence
			);
		}

		function isCloseOptionalSegment() {
			return (
				char === optionalEnd &&
				nextChar !== optionalEnd &&
				(isSegmentSeparator(nextChar) || nextChar === undefined) &&
				inOptionalSegment &&
				!inEscapeSequence
			);
		}

		if (skipSegment) {
			if (isSegmentSeparator(char)) {
				skipSegment = false;
			}
			continue;
		}

		if (isNewEscapeSequence()) {
			inEscapeSequence++;
			continue;
		}

		if (isCloseEscapeSequence()) {
			inEscapeSequence--;
			continue;
		}

		if (isNewOptionalSegment()) {
			inOptionalSegment++;
			optionalSegmentIndex = result.length;
			result += optionalStart;
			continue;
		}

		if (isCloseOptionalSegment()) {
			if (optionalSegmentIndex !== null) {
				result =
					result.slice(0, optionalSegmentIndex) +
					result.slice(optionalSegmentIndex + 1);
			}
			optionalSegmentIndex = null;
			inOptionalSegment--;
			result += "?";
			continue;
		}

		if (inEscapeSequence) {
			result += char;
			continue;
		}

		if (isSegmentSeparator(char)) {
			if (rawSegmentBuffer === "index" && result.endsWith("index")) {
				result = result.replace(/\/?index$/, "");
			} else {
				result += "/";
			}

			rawSegmentBuffer = "";
			inOptionalSegment = 0;
			optionalSegmentIndex = null;
			continue;
		}

		if (isStartOfLayoutSegment()) {
			skipSegment = true;
			continue;
		}

		rawSegmentBuffer += char;

		if (char === paramPrefixChar) {
			if (nextChar === optionalEnd) {
				throw new Error(
					`Invalid route path: ${partialRouteId}. Splat route $ is already optional`,
				);
			}
			result += typeof nextChar === "undefined" ? "*" : ":";
			continue;
		}

		result += char;
	}

	if (rawSegmentBuffer === "index" && result.endsWith("index")) {
		result = result.replace(/\/?index$/, "");
	}

	if (rawSegmentBuffer === "index" && result.endsWith("index?")) {
		throw new Error(
			`Invalid route path: ${partialRouteId}. Make index route optional by using (index)`,
		);
	}

	return result || undefined;
}

export function createRoutePath(partialRouteId: string): string | undefined {
	return toPath(partialRouteId) ?? "/";
	let result = "";
	let rawSegmentBuffer = "";

	let inEscapeSequence = 0;
	let inOptionalSegment = 0;
	let optionalSegmentIndex = null;
	let skipSegment = false;
	for (let i = 0; i < partialRouteId.length; i++) {
		const char = partialRouteId.charAt(i);
		const prevChar = i > 0 ? partialRouteId.charAt(i - 1) : undefined;
		const nextChar =
			i < partialRouteId.length - 1 ? partialRouteId.charAt(i + 1) : undefined;

		function isNewEscapeSequence() {
			return (
				!inEscapeSequence && char === escapeStart && prevChar !== escapeStart
			);
		}

		function isCloseEscapeSequence() {
			return inEscapeSequence && char === escapeEnd && nextChar !== escapeEnd;
		}

		function isStartOfLayoutSegment() {
			return char === "_" && nextChar === "_" && !rawSegmentBuffer;
		}

		function isNewOptionalSegment() {
			return (
				char === optionalStart &&
				prevChar !== optionalStart &&
				(isSegmentSeparator(prevChar) || prevChar === undefined) &&
				!inOptionalSegment &&
				!inEscapeSequence
			);
		}

		function isCloseOptionalSegment() {
			return (
				char === optionalEnd &&
				nextChar !== optionalEnd &&
				(isSegmentSeparator(nextChar) || nextChar === undefined) &&
				inOptionalSegment &&
				!inEscapeSequence
			);
		}

		if (skipSegment) {
			if (isSegmentSeparator(char)) {
				skipSegment = false;
			}
			continue;
		}

		if (isNewEscapeSequence()) {
			inEscapeSequence++;
			continue;
		}

		if (isCloseEscapeSequence()) {
			inEscapeSequence--;
			continue;
		}

		if (isNewOptionalSegment()) {
			inOptionalSegment++;
			optionalSegmentIndex = result.length;
			result += optionalStart;
			continue;
		}

		if (isCloseOptionalSegment()) {
			if (optionalSegmentIndex !== null) {
				result =
					result.slice(0, optionalSegmentIndex) +
					result.slice(optionalSegmentIndex + 1);
			}
			optionalSegmentIndex = null;
			inOptionalSegment--;
			result += "?";
			continue;
		}

		if (inEscapeSequence) {
			result += char;
			continue;
		}

		if (isSegmentSeparator(char)) {
			if (rawSegmentBuffer === "index" && result.endsWith("index")) {
				result = result.replace(/\/?index$/, "");
			} else {
				result += "/";
			}

			rawSegmentBuffer = "";
			inOptionalSegment = 0;
			optionalSegmentIndex = null;
			continue;
		}

		if (isStartOfLayoutSegment()) {
			skipSegment = true;
			continue;
		}

		rawSegmentBuffer += char;

		if (char === paramPrefixChar) {
			if (nextChar === optionalEnd) {
				throw new Error(
					`Invalid route path: ${partialRouteId}. Splat route $ is already optional`,
				);
			}
			result += typeof nextChar === "undefined" ? "*" : ":";
			continue;
		}

		result += char;
	}

	if (rawSegmentBuffer === "index" && result.endsWith("index")) {
		result = result.replace(/\/?index$/, "");
	}

	if (rawSegmentBuffer === "index" && result.endsWith("index?")) {
		throw new Error(
			`Invalid route path: ${partialRouteId}. Make index route optional by using (index)`,
		);
	}

	return result || undefined;
}

export function isSegmentSeparator(checkChar: string | undefined) {
	if (!checkChar) return false;
	return ["/", ".", path.win32.sep].includes(checkChar);
}

function getParentRouteIds(
	routeIds: string[],
): Record<string, string | undefined> {
	return routeIds.reduce<Record<string, string | undefined>>(
		(parentRouteIds, childRouteId) => ({
			...parentRouteIds,
			[childRouteId]: routeIds.find((id) => childRouteId.startsWith(`${id}/`)),
		}),
		{},
	);
}

function byLongestFirst(a: string, b: string): number {
	return b.length - a.length;
}

function visitFiles(
	dir: string,
	visitor: (file: string) => void,
	baseDir = dir,
): void {
	for (const filename of fs.readdirSync(dir)) {
		const file = path.resolve(dir, filename);
		const stat = fs.lstatSync(file);

		if (stat.isDirectory()) {
			visitFiles(file, visitor, baseDir);
		} else if (stat.isFile()) {
			visitor(path.relative(baseDir, file));
		}
	}
}

/*
eslint
  no-loop-func: "off",
*/
