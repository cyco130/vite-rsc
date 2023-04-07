import { useCallback } from "react";
import { createFromReadableStream } from "react-server-dom-webpack/client.browser";
import { useRouter } from "../shared/useRouter";
import { callServer } from "./stream";

export async function submitForm(formData: FormData) {
	const response = await fetch("", {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"x-action": formData.get("$$id") as string,
			"x-mutation": "1",
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error("Server error");
	}

	const data = createFromReadableStream(response.body!, { callServer });

	globalThis.mutate(data);

	return data;
}

export function useSubmitForm() {
	const router = useRouter();
	return useCallback(
		async (formData: FormData) => {
			const response = await fetch("", {
				method: "POST",
				headers: {
					Accept: "text/x-component",
					"x-action": formData.get("$$id") as string,
					"x-mutation": "1",
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Server error");
			}

			const data = createFromReadableStream(response.body!, { callServer });

			const redirectURL = response.headers.get("x-redirect");
			if (redirectURL) {
				router.cache.set(redirectURL, data);
				router.push(redirectURL);
			} else {
				globalThis.mutate(data);
			}

			return data;
		},
		[router],
	);
}
