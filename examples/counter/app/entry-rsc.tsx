import { renderToServerElementStream } from "stream-react/server";
import { createModuleMapProxy } from "stream-react/webpack";
import { text } from "node:stream/consumers";
let clientModuleMap = createModuleMapProxy();
import Root from "~/root?rsc";
import { collectStyles } from "stream-react/dev";

export default async function (event) {
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

	let stream = renderToServerElementStream(<Root {...event} />, {
		clientModuleMap,
	});

	console.log(await text(stream));
}
