import type { PageProps } from "fully-react/app-router";
import { component } from "fully-react/server";
import { Suspense } from "react";

import Layout from "../layout";
import Search from "../Search";

export const SearchResults = component(async function SearchResults({
	search,
}: {
	search: string;
}) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <div>Search results for {search}</div>;
});

export default function SearchPage({ searchParams }: PageProps) {
	let search = searchParams["q"] ?? "";
	return (
		<Layout title="Search">
			<Search initialSearch={search} />
			<Suspense fallback={<div>Loading...</div>}>
				<SearchResults search={search} />
			</Suspense>
		</Layout>
	);
}
