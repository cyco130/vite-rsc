import { SearchPage } from "./SearchPage";
import { A, PageProps } from "fully-react";
import { createRouter } from "fully-react/server";
import { Assets } from "stream-react/assets";

async function Root({ children }: PageProps) {
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
				<A href="/">Search</A> | <A href="/not-found">Not Found</A>
				<div id="root">{children}</div>
			</body>
		</html>
	);
}

export default createRouter([
	{
		path: "",
		component: Root,
		children: [{ index: true, component: SearchPage }],
	},
]);
