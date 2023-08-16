import { PageProps } from "fully-react";
import { createRouter } from "fully-react/server";
import { Suspense } from "react";
import HomePage from "./home";
import { AppleMusicDemo } from "./apple-music-demo";
import { Assets } from "fully-react/assets";

import "cal-sans";
import "./root.css";

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
				<Assets />
			</head>
			<body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
				{children}
			</body>
		</html>
	);
}

export default createRouter([
	{
		path: "",
		component: Root,
		children: [
			{ index: true, component: HomePage },
			{ path: "/demo", component: AppleMusicDemo },
			{ path: "/infinite", component: InfiniteChildren },
		],
	},
]);
