"use client";

import { A, PageProps } from "flight-router";
import { createRouter } from "flight-router/server";
import Counter from "./Counter";
import { Assets } from "stream-react/assets";
import { sayHello } from "./sayHello";

function CounterPage() {
	return <Counter initialCount={42} sayHello={sayHello} />;
}

export function Root({ children }: PageProps) {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<Assets />
			</head>
			<body>
				<div id="root">
					<A href="/">Home</A> | <A href="/about">About</A>
					{children}
				</div>
			</body>
		</html>
	);
}

export default createRouter([
	{
		path: "",
		component: Root,
		children: [
			{
				path: "/",
				component: CounterPage,
			},
			{
				path: "/about",
				component: () => {
					return <div>About</div>;
				},
			},
		],
	},
]);
