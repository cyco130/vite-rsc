"use client";

import { useEffect, useState } from "react";

export default function Counter({
	initialCount = 0,
}: {
	initialCount?: number;
}) {
	const [count, setCount] = useState(initialCount);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
