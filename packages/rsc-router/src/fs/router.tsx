import * as fs from "fs";
import * as path from "path";
import minimatch from "minimatch";

import type { RouteManifest, DefineRouteFunction } from "./route";
import { defineRoutes, createRouteId } from "./route";

export const routeModuleExts = [".js", ".jsx", ".ts", ".tsx", ".md", ".mdx"];

export function isRouteModuleFile(filename: string): boolean {
	return routeModuleExts.includes(path.extname(filename));
}

export function toPath(id: string, removePathlessLayouts = true) {
	const idWithoutIndex = id.endsWith("/page")
		? id.slice(0, -"page".length)
		: id;

	const idWithoutLayout = idWithoutIndex.endsWith("/(layout)")
		? idWithoutIndex.slice(0, -"/(layout)".length)
		: idWithoutIndex;
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
	ignoredFilePatterns?: string[],
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

			const isIndexRoute = routeId.endsWith("/");
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

// Create a map of routes by parentId to use recursively instead of
// repeatedly filtering the manifest.
export function groupRoutesByParentId(manifest: RouteManifest) {
	const routes: Record<string, Omit<any, "children">[]> = {};

	Object.values(manifest).forEach((route) => {
		const parentId = route.parentId || "";
		if (!routes[parentId]) {
			routes[parentId] = [];
		}
		routes[parentId].push(route);
	});

	return routes;
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
