import { FC } from "react";

const linkProps = [
	["js", { rel: "modulepreload", crossOrigin: "" }],
	["jsx", { rel: "modulepreload", crossOrigin: "" }],
	["ts", { rel: "modulepreload", crossOrigin: "" }],
	["tsx", { rel: "modulepreload", crossOrigin: "" }],
	["css", { rel: "stylesheet" }],
	["woff", { rel: "preload", as: "font", type: "font/woff", crossOrigin: "" }],
	[
		"woff2",
		{ rel: "preload", as: "font", type: "font/woff2", crossOrigin: "" },
	],
	["gif", { rel: "preload", as: "image", type: "image/gif" }],
	["jpg", { rel: "preload", as: "image", type: "image/jpeg" }],
	["jpeg", { rel: "preload", as: "image", type: "image/jpeg" }],
	["png", { rel: "preload", as: "image", type: "image/png" }],
	["webp", { rel: "preload", as: "image", type: "image/webp" }],
	["svg", { rel: "preload", as: "image", type: "image/svg+xml" }],
	["ico", { rel: "preload", as: "image", type: "image/x-icon" }],
	["avif", { rel: "preload", as: "image", type: "image/avif" }],
	["mp4", { rel: "preload", as: "video", type: "video/mp4" }],
	["webm", { rel: "preload", as: "video", type: "video/webm" }],
] as const;

type Linkprop = (typeof linkProps)[number][1];

const linkPropsMap = new Map<string, Linkprop>(linkProps);

/**
 * Generates a link tag for a given file. This will load stylesheets and preload
 * everything else. It uses the file extension to determine the type.
 */
export const LinkTag: FC<{ file: string }> = ({ file }) => {
	const ext = file.split(".").pop();
	if (!ext) {
		return null;
	}
	const props = linkPropsMap.get(ext);
	if (!props) {
		return null;
	}

	return <link href={file} {...props} />;
};
