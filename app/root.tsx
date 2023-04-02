import fs from "node:fs";
import A from "../modules/router/client/A";
import { SearchPage } from "./SearchPage";
import { createRouter } from "../modules/router/server/createRouter";

async function PackageJSON() {
	const packageJson = await fs.promises.readFile("package.json", "utf8");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <pre>{packageJson}</pre>;
}

export function Root({ children }: { children: any }) {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
			</head>
			<body>
				<div>
					<A href="/">Home</A>
					{" | "}
					<A href="/pkg">Package</A>
				</div>
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
			{ path: "/", component: SearchPage },
			{
				path: "/pkg",
				component: PackageJSON,
			},
		],
	},
]);
