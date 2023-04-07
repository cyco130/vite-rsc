import React, { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { Root } from "./root";
import { setupWebpackEnv } from "./webpack";
import { initMutation } from "./mutation";

export function mount(
	options: { load?: (chunk: string) => Promise<any> } = {},
) {
	setupWebpackEnv(options.load);

	initMutation();

	startTransition(() => {
		hydrateRoot(
			document,
			<StrictMode>
				<Root />
			</StrictMode>,
			{
				onRecoverableError(err) {
					console.error(err);
				},
			},
		);
	});
}
