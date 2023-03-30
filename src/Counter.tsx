"use client";

import { useState } from "react";

export interface CounterProps {
	initialCount?: number;
}

export default function Counter({ initialCount = 0 }: CounterProps) {
	const [count, setCount] = useState(initialCount);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
