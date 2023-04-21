import { A } from "fully-react";
import { PageConfig, PageProps } from "./[...stories].types";
import Story from "~/components/story";
import fetchAPI from "~/api";
import { IStory } from "~/types";

export const config = {
	validateSearch: (searchParams) => {
		return { page: searchParams.page as number };
	},
} satisfies PageConfig;

const mapStories: Record<string, string> = {
	top: "news",
	new: "newest",
	show: "show",
	ask: "ask",
	job: "jobs",
};

export default async function Stories({ searchParams, params }: PageProps) {
	let type =
		params["*"].length && mapStories[params["*"]] ? params["*"] : "top";
	let page = +searchParams.page || 1;
	let stories = await fetchAPI<IStory[]>(`${mapStories[type]}?page=${page}`);

	// const { page, type, stories } = await ;
	return (
		<div className="news-view">
			<div className="news-list-nav">
				{page > 1 ? (
					<A
						className="page-link"
						href={`/${type}?page=${page - 1}`}
						aria-label="Previous Page"
					>
						{"<"} prev
					</A>
				) : (
					<span className="page-link disabled" aria-disabled="true">
						{"<"} prev
					</span>
				)}

				<span>page {page}</span>
				{stories.length >= 29 ? (
					<A
						className="page-link"
						href={`/${type}?page=${page + 1}`}
						aria-label="Next Page"
					>
						more {">"}
					</A>
				) : (
					<span className="page-link disabled" aria-disabled="true">
						more {">"}
					</span>
				)}
			</div>
			<main className="news-list">
				<ul>
					{stories.map((story) => (
						<Story story={story} />
					))}
				</ul>
			</main>
		</div>
	);
}
