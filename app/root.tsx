import Counter from "./Counter";
import fs from "node:fs";
import { createServerContext, useContext, Suspense, use } from "react";
import { RouterContext } from "@hattip/router";
// globalThis.serverContext = globalThis.serverContext ?? createServerContext("Hello", {});

async function MoreData() {
	// const con = useContext(context);
	// console.log(con);
	const packageJson = await fs.promises.readFile("package.json", "utf8");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <pre>{packageJson}</pre>;
}

let routes = {
	"/": <Counter />,
	"/more": <MoreData />,
} as any;

export default function Routes(context: RouterContext) {
	return (
		<body>
			<div>
				<a href="/">Home</a>
				<a href="/more">More</a>
			</div>
			{routes[context.url.pathname] ?? <div>404</div>}
		</body>
	);
}
