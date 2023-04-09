import { PageProps, createRouter } from "flight-router/server";
import Counter from "./Counter";
import { sayHello } from "./sayHello";
import { A } from "flight-router";
import { notFound } from "stream-react/navigation";

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
					<A href="/404">404</A>
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
					console.log("rendering component");
					notFound();
					return <div>About</div>;
				},
			},
		],
	},
]);
