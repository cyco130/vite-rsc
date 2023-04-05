"use client";

import { useState } from "react";
export function Button() {
	const [count, setCount] = useState(0);
	return (
		<button onClick={() => setCount((count) => count + 1)}>
			count is {count}
		</button>
	);
}

export const Btn = Button;

export { Button as Btn2 };

export default Button;
