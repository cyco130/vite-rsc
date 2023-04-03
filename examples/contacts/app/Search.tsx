"use client";

import { useRouter } from "../modules/router/client/useRouter";
import { useTransition } from "react";

export default function Search({ search: initialSearch }: { search: string }) {
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
