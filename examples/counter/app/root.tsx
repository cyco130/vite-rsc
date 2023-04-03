import { SearchPage } from "./SearchPage";
import { PageProps } from "@vite-rsc/router/server";
import Counter from "./Counter";
import sayHello from "./sayHello";

export default async function Root(props: PageProps) {
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
					<div>
						<SearchPage {...props} />
					</div>
				</div>
			</body>
		</html>
	);
}
