import { SearchPage } from "./SearchPage";
import { Suspense } from "react";
import { A, createRouter, PageProps } from "fully-react";
import { InlineStyles } from "fully-react/server";

const InfiniteChildren: any = async ({ level = 0 }) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return (
		<div
			style={{ border: "1px red dashed", margin: "0.1em", padding: "0.1em" }}
		>
			<div>Level {level}</div>
			<Suspense fallback="Loading...">
				<InfiniteChildren level={level + 1} />
			</Suspense>
		</div>
	);
};

async function Root({ children }: PageProps) {
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
				<A href="/">Search</A> | <A href="/infinite">Infinite</A> |{" "}
				<A href="/not-found">Not Found</A>
				<div id="root">{children}</div>
			</body>
		</html>
	);
}

export default createRouter([
	{
		path: "",
		component: Root,
		children: [
			{ index: true, component: SearchPage },
			{ path: "/infinite", component: InfiniteChildren },
		],
	},
]);
