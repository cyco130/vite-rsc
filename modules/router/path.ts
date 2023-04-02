/**
 * MIT License
 *
 * Copyright (c) React Training 2015-2019
 * Copyright (c) Remix Software 2020-2022
 */

/**
 * Describes a location that is the destination of some navigation, either via
 * `history.push` or `history.replace`. May be either a URL or the pieces of a
 * URL path.
 */
export type To = string | Partial<Path>;

/**
 * The pathname, search, and hash values of a URL.
 */
export interface Path {
	/**
	 * A URL pathname, beginning with a /.
	 */
	pathname: string;

	/**
	 * A URL search string, beginning with a ?.
	 */
	search: string;

	/**
	 * A URL fragment identifier, beginning with a #.
	 */
	hash: string;
}

/**
 * An entry in a history stack. A location contains information about the
 * URL path, as well as possibly some arbitrary state and a key.
 */
export interface Location extends Path {
	/**
	 * A value of arbitrary data associated with this location.
	 */
	state: any;

	/**
	 * A unique string associated with this location. May be used to safely store
	 * and retrieve data in some other storage API, like `localStorage`.
	 *
	 * Note: This value is always "default" on the initial location.
	 */
	key: string;
}

/**
 * @private
 */
export function invariant(value: boolean, message?: string): asserts value;
export function invariant<T>(
	value: T | null | undefined,
	message?: string,
): asserts value is T;
export function invariant(value: any, message?: string) {
	if (value === false || value === null || typeof value === "undefined") {
		throw new Error(message);
	}
}

export function warning(cond: any, message: string) {
	if (!cond) {
		// eslint-disable-next-line no-console
		if (typeof console !== "undefined") console.warn(message);

		try {
			// Welcome to debugging history!
			//
			// This error is thrown as a convenience so you can more easily
			// find the source for a warning that appears in the console by
			// enabling "pause on exceptions" in your JavaScript debugger.
			throw new Error(message);
			// eslint-disable-next-line no-empty
		} catch (e) {}
	}
}

function createKey() {
	return Math.random().toString(36).substr(2, 8);
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 */

export function parsePath(path: string): Partial<Path> {
	let parsedPath: Partial<Path> = {};

	if (path) {
		let hashIndex = path.indexOf("#");
		if (hashIndex >= 0) {
			parsedPath.hash = path.substr(hashIndex);
			path = path.substr(0, hashIndex);
		}

		let searchIndex = path.indexOf("?");
		if (searchIndex >= 0) {
			parsedPath.search = path.substr(searchIndex);
			path = path.substr(0, searchIndex);
		}

		if (path) {
			parsedPath.pathname = path;
		}
	}

	return parsedPath;
}

/**
 * Creates a Location object with a unique key from the given Path
 */
export function createLocation(
	current: string | Location,
	to: To,
	state: any = null,
	key?: string,
): Readonly<Location> {
	let location: Readonly<Location> = {
		pathname: typeof current === "string" ? current : current.pathname,
		search: "",
		hash: "",
		...(typeof to === "string" ? parsePath(to) : to),
		state,
		// TODO: This could be cleaned up.  push/replace should probably just take
		// full Locations now and avoid the need to run through this flow at all
		// But that's a pretty big refactor to the current test suite so going to
		// keep as is for the time being and just let any incoming keys take precedence
		key: (to && (to as Location).key) || key || createKey(),
	};
	return location;
}

/**
 * Creates a string URL path from the given pathname, search, and hash components.
 */
export function createPath({
	pathname = "/",
	search = "",
	hash = "",
}: Partial<Path>) {
	if (search && search !== "?")
		pathname += search.charAt(0) === "?" ? search : "?" + search;
	if (hash && hash !== "#")
		pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
	return pathname;
}
