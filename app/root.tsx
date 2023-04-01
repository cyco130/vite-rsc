import Counter from "./Counter";
import fs from "node:fs";
import { createServerContext, useContext, Suspense, use } from "react";
import { RouterContext } from "@hattip/router";
import Search from "./Search";
import A from "../modules/router/A";
// globalThis.serverContext = globalThis.serverContext ?? createServerContext("Hello", {});

async function MoreData() {
	// const con = useContext(context);
	// console.log(con);
	const packageJson = await fs.promises.readFile("package.json", "utf8");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <pre>{packageJson}</pre>;
}

async function SearchResults({ search }: { search: string }) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <div>Search results for {search}</div>;
}

type PageProps = {
	params: Record<string, string>;
	searchParams: Record<string, string>;
};

function SearchPage({ searchParams }: PageProps) {
	return (
		<>
			<Search search={searchParams.q} />
			<Suspense fallback={<div>Loading...</div>}>
				<SearchResults search={searchParams.q} />
			</Suspense>
		</>
	);
}

const routes = {
	"/": SearchPage,
	"/more": MoreData,
} as Record<string, any>;

export default function Routes(context: RouterContext) {
	let Component = routes[context.url.pathname] as any;
	return (
		<>
			<div>
				<A href="/">Home</A>
				<A href="/more">More</A>
			</div>
			{(
				<Component
					pathname={context.url.pathname}
					searchParams={Object.fromEntries(context.url.searchParams.entries())}
				/>
			) ?? <div>404</div>}
		</>
	);
}
