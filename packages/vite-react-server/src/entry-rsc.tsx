import { renderToServerElementStream } from "stream-react/react-server-streams";
import { createModuleMapProxy, setupWebpackEnv } from "stream-react/webpack";
import { isNotFoundError, isRedirectError } from "stream-react/navigation";
import React from "react";

function createDevRenderer() {
	setupWebpackEnv();

	const clientModuleMap = createModuleMapProxy();

	globalThis.env = {
		findAssets: async () => {
			const { default: devServer } = await import("virtual:vite-dev-server");
			const { collectStyles } = await import("stream-react/dev");

			const styles = await collectStyles(devServer, ["~/root?rsc"]);
			return [
				// @ts-ignore
				...Object.entries(styles ?? {}).map(([key, value]) => ({
					type: "style" as const,
					style: value,
					src: key,
				})),
			];
		},
	};

	return async (src: string, props: any) => {
		const { default: devServer } = await import("virtual:vite-dev-server");
		const { default: Root } = await devServer.ssrLoadModule("~/root?rsc");
		return renderToServerElementStream(<Root {...props} />, clientModuleMap, {
			onError: (error: Error) => {
				if (isNotFoundError(error) || isRedirectError(error)) {
					return error.digest;
				}
			},
		});
	};
}

function createProdRenderer() {
	// assumes an environment has been setup by the SSR handler
	return async (src: string, props: any) => {
		const component = await import(
			"./" + globalThis.reactServerManifest["app/root.tsx"].file
		);
		return renderToServerElementStream(
			<component.default {...props} />,
			createModuleMapProxy(),
			{
				onError: (error: Error) => {
					if (isNotFoundError(error) || isRedirectError(error)) {
						return error.digest;
					}

					console.log(error);
				},
			},
		);
	};
}

export default async function (event: { src: string; props: any }) {
	const render =
		process.env.NODE_ENV === "development"
			? createDevRenderer()
			: createProdRenderer();
	return await render(event.src, event.props);
}
