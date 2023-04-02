import type { PageProps } from "../modules/router/types";
import { Suspense } from "react";
import Search from "./Search";

async function SearchResults({ search }: { search: string }) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return <div>Search results for {search}</div>;
}

export default function SearchPage({ searchParams }: PageProps) {
	return (
		<>
			<Search search={searchParams.q} />
			<Suspense fallback={<div>Loading...</div>}>
				<SearchResults search={searchParams.q} />
			</Suspense>
		</>
	);
}
