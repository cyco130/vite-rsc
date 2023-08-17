import { Assets } from "fully-react/assets";

import Hello from "../hello.mdx";
import Counter from "../Counter";
import { sayHello } from "../sayHello";

export default function Layout() {
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
					<Counter initialCount={42} sayHello={sayHello} />
					<Hello />
				</div>
			</body>
		</html>
	);
}
