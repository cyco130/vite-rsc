import entry from "./dist/react-server/react-server.js";
import { text } from "stream/consumers";

console.log(
	await text(
		await entry({
			props: {},
		}),
	),
);
