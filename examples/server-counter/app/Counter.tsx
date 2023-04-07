"use client";

import { useRouter } from "stream-react/router";
import { useMutation } from "stream-react/mutation";

export default function Counter({
	count = 0,
	increment,
}: {
	count: number;
	increment: () => Promise<number>;
}) {
	const mutate = useMutation();
	const router = useRouter();
	return (
		<div>
			<p>Count: {count}</p>
			<button
				onClick={() => {
					mutate(() => increment());
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
		</div>
	);
}
