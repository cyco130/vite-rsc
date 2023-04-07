import { mount } from "flight-router/client/entry";

// Load the route modules as RSC and export for impala

mount({
	load: (id) => {
		import("./components/button");

		return import(
			/* @vite-ignore */ `/` +
				globalThis.___CONTEXT.manifest[
					id.slice(globalThis.___CONTEXT.root.length + 1)
				].file
		);
	},
});
