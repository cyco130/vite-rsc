"use client";

import { A, PageProps, useRouter } from "rsc-router";
import Counter from "./Counter";
import { sayHello } from "./sayHello";

const routes: Record<string, React.ComponentType> = {
	"/": () => <Counter initialCount={42} sayHello={sayHello} />,
	"/about": () => <A href="/about">About</A>,
};

export default function Root({ url }: PageProps) {
	let Route = routes[new URL(url).pathname];
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
			</head>
			<body>
				<div id="root">
					<A href="/">Home</A> | <A href="/about">About</A>
					<Route />
				</div>
			</body>
		</html>
	);
}
