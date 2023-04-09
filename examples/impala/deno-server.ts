import { lookup } from "https://deno.land/x/media_types/mod.ts";

import { serve } from "https://deno.land/std@0.139.0/http/server.ts";

serve(
	async (request) => {
		const { pathname } = new URL(request.url);
		console.log(pathname);

		// This is how the server works:
		// 1. A request comes in for a specific asset.
		// 2. We read the asset from the file system.
		// 3. We send the asset back to the client.

		try {
			const file = await Deno.readFile(`./${pathname}`);
			const isAsset = pathname.startsWith("/assets/");

			// Respond to the request with the style.css file.
			return new Response(file, {
				headers: {
					"content-type": lookup(pathname),
					...(isAsset
						? {
								"cache-control": "public, immutable, max-age=31536000",
						  }
						: {}),
				},
			});
		} catch (e) {}

		try {
			let text = await Deno.readFile(`./${pathname}.html`);
			return new Response(text, {
				headers: {
					"content-type": "text/html",
				},
			});
		} catch (e) {}

		if (pathname === "/") {
			let text = await Deno.readFile(`./index.html`);
			return new Response(text, {
				headers: {
					"content-type": "text/html",
				},
			});
		}

		return new Response("Not Found", {
			status: 404,
		});
	},
	{
		port: Number(Deno.env.get("PORT") ?? "8080"),
	},
);
