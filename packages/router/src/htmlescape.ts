/**
 * Properly escape JSON for usage as an object literal inside of a `<script>` tag.
 * JS implementation of http://golang.org/pkg/encoding/json/#HTMLEscape
 * More info: http://timelessrepo.com/json-isnt-a-javascript-subset
 */

"use strict";

// const ESCAPE_LOOKUP = {
// 	"&": "\\u0026",
// 	">": "\\u003e",
// 	"<": "\\u003c",
// 	"\u2028": "\\u2028",
// 	"\u2029": "\\u2029",
// };

// const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

// function escaper(match) {
// 	return ESCAPE_LOOKUP[match];
// }

/***/

const TERMINATORS_LOOKUP = {
	"\u2028": "\\u2028",
	"\u2029": "\\u2029",
};

const TERMINATORS_REGEX = /[\u2028\u2029]/g;

function sanitizer(match) {
	return TERMINATORS_LOOKUP[match];
}

export function sanitize(str) {
	return str.replace(TERMINATORS_REGEX, sanitizer);
}
