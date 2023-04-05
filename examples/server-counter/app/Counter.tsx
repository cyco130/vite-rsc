"use client";

import { useCallback } from "react";
import { useRouter } from "rsc-router";

// let mutationMode = 0

// function useAction<T extends (...args: any[]) => Promise<any>>(fn: T) {
// 	return useCallback(
// 		(...args: Parameters<T>) => {
// 			return fn(...args);
// 		},
// 		[fn],
// 	);
// }

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
		</div>
	);
}
