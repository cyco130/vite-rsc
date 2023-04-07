"use client";

import { useRouter } from "flight-router";
import { useTransition } from "react";

export default function Search({ initialSearch }: { initialSearch: string }) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	return (
		<>
			<input
				defaultValue={initialSearch}
				onChange={(e) => {
					startTransition(() => {
						router.replace("/?q=" + e.target.value);
					});
				}}
			/>
			{isPending ? "Loading..." : ""}
		</>
	);
}
