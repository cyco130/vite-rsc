import { SearchPage } from "./SearchPage";
import { PageProps } from "@vite-rsc/router/server";
import Counter from "./Counter";

// const InfiniteChildren: any = async ({ level = 0 }) => {
// 	await new Promise((resolve) => setTimeout(resolve, 1000));
// 	return (
// 		<div
// 			style={{ border: "1px red dashed", margin: "0.1em", padding: "0.1em" }}
// 		>
// 			<div>Level {level}</div>
// 			<Suspense fallback="Loading...">
// 				<InfiniteChildren level={level + 1} />
// 			</Suspense>
// 		</div>
// 	);
// };

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
					<Counter initialCount={42} />
					<div>
						<SearchPage {...props} />
					</div>
				</div>
			</body>
		</html>
	);
}
