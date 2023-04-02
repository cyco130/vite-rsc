import { getMovie, getTrending, getTvShow } from "./services/tmdbAPI";
import Hero from "./components/Hero";

export async function Home() {
	async function getHome() {
		try {
			const trendingMovies = await getTrending("movie");
			const trendingTv = await getTrending("tv");
			let featured;

			// feature a random item from movies or tv
			const items = [...trendingMovies.results, ...trendingTv.results];
			// const randomItem = items[Math.floor(Math.random() * items.length)];
			const randomItem = items[0];
			const media = randomItem.title ? "movie" : "tv";

			if (media === "movie") {
				featured = await getMovie(randomItem.id);
			} else {
				featured = await getTvShow(randomItem.id);
			}

			return {
				trendingMovies,
				trendingTv,
				featured,
			};
		} catch {
			throw new Error("Data not available");
		}
	}

	let { trendingMovies, trendingTv, featured } = await getHome();

	return (
		<main className="main">
			<Hero item={featured} />
		</main>
	);
}
