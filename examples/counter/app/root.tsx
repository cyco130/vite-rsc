import Counter from "./Counter";
import { sayHello } from "./sayHello";
import { InlineStyles } from "flight-router/server";

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
				</div>
			</body>
		</html>
	);
}
