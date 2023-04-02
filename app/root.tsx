import { RouterContext } from "@hattip/router";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { Home } from "./Home";
import { TV } from "./TV";
import { getMovies } from "./services/tmdbAPI";
import Hero from "./components/Hero";

async function Movie() {
	let movies = await getMovies("popular");
	return (
		<main>
			<Hero item={movies.results[0]} />
		</main>
	);
}

const routes = {
	"/": Home,
	"/tv": TV,
	"/movie": Movie,
} as Record<string, any>;

export default function Routes(context: RouterContext) {
	let RouteComponent = routes[context.url.pathname] as any;

	if (!RouteComponent) {
		return <div>404</div>;
	}

	return (
		<>
			<Nav />
			<RouteComponent
				pathname={context.url.pathname}
				searchParams={Object.fromEntries(context.url.searchParams.entries())}
			/>
			<Footer />
		</>
	);
}
