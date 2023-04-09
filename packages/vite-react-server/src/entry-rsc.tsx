import { renderToServerElementStream } from "stream-react/server";
import { createModuleMapProxy, setupWebpackEnv } from "stream-react/webpack";
import { collectStyles } from "stream-react/dev";
import { isNotFoundError, isRedirectError } from "stream-react/navigation";
import React from "react";

function createDevEnv() {
	setupWebpackEnv();
	if (import.meta.env.DEV) {
		globalThis.findAssets = async () => {
			const { default: devServer } = await import("virtual:vite-dev-server");
			const styles = await collectStyles(devServer, ["~/root?rsc"]);
			return [
				// @ts-ignore
				...Object.entries(styles ?? {}).map(([key, value]) => ({
					type: "style" as const,
					style: value,
					src: key,
				})),
			];
		};
	} else {
	}

	const clientModuleMap = createModuleMapProxy();

	return {
		clientModuleMap,
	};
}

const env = createDevEnv();

export default async function (event) {
	const { default: devServer } = await import("virtual:vite-dev-server");
	const { default: Root } = await devServer.ssrLoadModule("~/root?rsc");
	return renderToServerElementStream(
		<Root {...event.props} />,
		env.clientModuleMap,
		{
			onError: (error) => {
				if (isNotFoundError(error) || isRedirectError(error)) {
					return error.digest;
				}
			},
		},
	);
}
