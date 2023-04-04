import Counter from "./Counter";
import { sayHello } from "./sayHello";

export default function Root() {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
			</head>
			<body>
				<div id="root">
					<Counter initialCount={42} sayHello={sayHello} />
				</div>
			</body>
		</html>
	);
}
