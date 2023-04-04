"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export default function Counter({
	initialCount = 0,
	sayHello,
}: {
	initialCount?: number;
	sayHello: (message: string, name: string) => Promise<string>;
}) {
	const [count, setCount] = useState(initialCount);

	return (
		<div>
			<p>Count: {count}</p>
			<Button>
				<Check />
				Increment
			</Button>

			<button
				onClick={() => {
					setCount(count + 1);
					sayHello(`Incremented to ${count + 1}`, "App").then((res) => {
						console.log(res);
					});
				}}
			>
				Increment
			</button>
		</div>
	);
}
