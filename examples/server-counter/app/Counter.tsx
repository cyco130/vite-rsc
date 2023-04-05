"use client";

import { useRouter } from "rsc-router";
import { signIn } from "./auth/client";

export default function Counter({
	count = 0,
	increment,
}: {
	count: number;
	increment: () => Promise<number>;
}) {
	const router = useRouter();
	return (
		<div>
			<p>Count: {count}</p>
			<button
				onClick={() => {
					router.mutate(() => increment());
				}}
			>
				Increment
			</button>
			<button
				onClick={() => {
					router.refresh();
				}}
			>
				Refresh
			</button>
			<button onClick={() => signIn("github")}>Sign In</button>
		</div>
	);
}
