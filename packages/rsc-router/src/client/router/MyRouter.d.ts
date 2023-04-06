import { RootRoute, Router, Route } from "./types";

type MyRouter = Router<
	Route<
		RootRoute<
			unknown,
			{
				a: string;
			}
		>,
		"/hello"
	>
>;

declare module "./src/router" {
	interface Register {
		router: MyRouter;
	}
}
