import React, { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { Root } from "./root";
import { setupWebpackEnv } from "./webpack";

export function mount() {
	setupWebpackEnv();

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
