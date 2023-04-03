import { ComponentType, Suspense, lazy } from "react";

const routes: Record<string, ComponentType | undefined> = {
	"/": lazy(() => import("./routes/Home")),
	"/foo": lazy(() => import("./routes/Foo")),
};

export interface AppProps {
	path: string;
}

export function App(props: AppProps) {
	const Route = routes[props.path] ?? (() => <h1>Not Found</h1>);

	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<title>Hello</title>
			</head>
			<body>
				<nav>
					<ul style={{ listStyle: "none", padding: 0 }}>
						{Object.keys(routes).map((path) => (
							<li
								key={path}
								style={{ display: "inline-block", margin: "0 1rem" }}
							>
								<a href={path}>{path}</a>
							</li>
						))}
					</ul>
				</nav>
				<div id="app">
					<Route />
				</div>
			</body>
		</html>
	);
}
