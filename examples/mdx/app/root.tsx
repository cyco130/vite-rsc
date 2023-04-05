import Counter from "./Counter";
import { sayHello } from "./sayHello";
import { InlineStyles } from "rsc-router/server";
import Hello from "./hello.mdx";

export default function Root() {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<InlineStyles />
			</head>
			<body>
				<div id="root">
					<Counter initialCount={42} sayHello={sayHello} />
					<Hello />
				</div>
			</body>
		</html>
	);
}
