import { renderToServerElementStream } from "stream-react/server";
import { createModuleMapProxy } from "stream-react/webpack";
import { text } from "node:stream/consumers";
let clientModuleMap = createModuleMapProxy();
import Root from "~/root?rsc";

export default async function (event) {
	let stream = renderToServerElementStream(<Root {...event} />, {
		clientModuleMap,
	});

	console.log(await text(stream));
}
