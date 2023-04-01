"use client";

import { useState, useTransition } from "react";

export default function Search({ search: initialSearch }: { search: string }) {
	const [isPending, startTransition] = useTransition();
	return (
		<>
			<input
				defaultValue={initialSearch}
				onChange={(e) => {
					startTransition(() => {
						window.router.replace("/?q=" + e.target.value);
					});
				}}
			/>
			{isPending ? "Loading..." : ""}
		</>
	);
}
