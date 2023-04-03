"use client";

import { useEffect, useState } from "react";

export interface CounterProps {
	initialCount?: number;
}

export default function Counter({ initialCount = 0 }: CounterProps) {
	const [count, setCount] = useState(initialCount);

	useEffect(() => {
		console.log("mounted");
	}, []);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
