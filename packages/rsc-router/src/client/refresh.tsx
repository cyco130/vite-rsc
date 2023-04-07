import { createElementFromRSCFetch } from "./stream";

export function refresh() {
	const element = createElementFromRSCFetch();
	globalThis.mutate(element);
}
