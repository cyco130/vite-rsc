import { createElementFromServer } from "./stream";

export const refresh =
	typeof window === "undefined"
		? () => {}
		: function refresh() {
				const element = createElementFromServer();
				globalThis.mutate(element);
		  };
