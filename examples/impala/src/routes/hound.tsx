import { App } from "../App";
import type { StaticRouteProps } from "@impalajs/core";

export default async function Hello({
	path,
	routeData,
}: StaticRouteProps<typeof import("./hello.data")>) {
	const hounds = await fetch("https://dog.ceo/api/breed/hound/list").then(
		(res) => res.json(),
	);

	return (
		<App title="Hounds">
			<ul>
				{hounds.message.map((hound: string) => (
					<li key={hound}>{hound}</li>
				))}
			</ul>
		</App>
	);
}
