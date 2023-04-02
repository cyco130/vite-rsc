import { rsc } from "./rsc";
import { hattip } from "@hattip/vite";

export default function react() {
	return [
		hattip({
			hattipEntry: "./modules/router/server.ts",
		}),
		rsc(),
	];
}
