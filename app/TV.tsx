import { getTvShow } from "./services/tmdbAPI";
import Hero from "./components/Hero";

export async function TV() {
	const popular = await getTvShow("popular");

	return (
		<main className="main">
			<Hero item={popular.results[0]} />
		</main>
	);
}
