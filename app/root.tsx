import Counter from "./Counter";
import fs from "node:fs";
import { createServerContext, useContext, use } from "react";
import { RouterContext } from "@hattip/router";
import A from "../modules/router/A";
import { SearchPage } from "./SearchPage";

async function PackageJSON() {
	const packageJson = await fs.promises.readFile("package.json", "utf8");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <pre>{packageJson}</pre>;
}

const routes = {
	"/": SearchPage,
	"/pkg": PackageJSON,
} as Record<string, any>;

export default function Root(context: RouterContext) {
	let Component = routes[context.url.pathname] as any;
	return (
		<html>
			<head>
				<title>RSC Playground</title>
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
			</head>
			<body>
				<div>
					<A href="/">Home</A>
					<A href="/pkg">Package</A>
				</div>
				{(
					<Component
						pathname={context.url.pathname}
						searchParams={Object.fromEntries(
							context.url.searchParams.entries(),
						)}
					/>
				) ?? <div>404</div>}
			</body>
		</html>
	);
}
