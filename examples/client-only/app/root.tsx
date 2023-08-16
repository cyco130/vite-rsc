"use client";

import A from "fully-react/link";
import { Assets } from "fully-react/assets";
import { PageProps } from "fully-react/types";

import Counter from "./Counter";
import { sayHello } from "./sayHello";

import "./root.css";

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
				<Assets />
			</head>
			<body>
				<div id="root">
					<A href="/">Home</A> | <A href="/about">About</A>
					{Route ? <Route /> : <div>404</div>}
				</div>
			</body>
		</html>
	);
}
