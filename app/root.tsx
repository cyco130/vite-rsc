import fs from "node:fs";
import A from "../modules/router/client/A";
import { SearchPage } from "./SearchPage";
import { createRouter } from "../modules/router/server/createRouter";

async function PackageJSON() {
	const packageJson = await fs.promises.readFile("package.json", "utf8");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <pre>{packageJson}</pre>;
}

function Root({ children }: { children: any }) {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
			</head>
			<body>
				<div id="root">
					<div id="sidebar">
						<div>
							<form id="search-form" role="search">
								<input
									id="q"
									aria-label="Search contacts"
									placeholder="Search"
									type="search"
									name="q"
								/>
								<div id="search-spinner" aria-hidden hidden={true} />
								<div className="sr-only" aria-live="polite"></div>
							</form>
							<form method="post">
								<button type="submit">New</button>
							</form>
						</div>
						<nav>
							<ul>
								<li>
									<a href={`/contacts/1`}>Your Name</a>
								</li>
								<li>
									<a href={`/contacts/2`}>Your Friend</a>
								</li>
							</ul>
						</nav>
					</div>
					<div id="detail">{children}</div>
				</div>
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
