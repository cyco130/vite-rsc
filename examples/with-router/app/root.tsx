import { PageProps, createRouter } from "fully-react/server";
import Counter from "./Counter";
import { sayHello } from "./sayHello";
import { A } from "fully-react";
import { notFound, redirect } from "fully-react/navigation";

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
			</head>
			<body>
				<div id="root">
					<A href="/">Home</A> | <A href="/about">About</A> |{" "}
					<A href="/not-found">Not found</A> | <A href="/404">404</A> |{" "}
					<A href="/redirect">Redirect</A>
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
					return <div>about</div>;
				},
			},
			{
				path: "/not-found",
				component: () => {
					console.log("rendering component");
					notFound();
					return <div>About</div>;
				},
			},
			{
				path: "/redirect",
				component: () => {
					redirect("/");
					return <div>About</div>;
				},
			},
		],
	},
]);
