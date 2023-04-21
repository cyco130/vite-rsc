import type { PageProps } from "fully-react";
import { component } from "stream-react/server";
import { Suspense } from "react";
import Search from "./Search";

export const SearchResults = component(async function SearchResults({
	search,
}: {
	search: string;
}) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <div>Search results for {search}</div>;
});

export function SearchPage({ searchParams }: PageProps) {
	let search = searchParams["q"] ?? "";
	return (
		<>
			<Search initialSearch={search} />
			<Suspense fallback={<div>Loading...</div>}>
				<SearchResults search={search} />
			</Suspense>
		</>
	);
}
