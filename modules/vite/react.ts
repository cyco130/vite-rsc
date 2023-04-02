import { rsc } from "./rsc";
import { hattip } from "@hattip/vite";

export default function react() {
	return [
		hattip({
			hattipEntry: "./modules/render/server.ts",
		}),
		rsc(),
	];
}
