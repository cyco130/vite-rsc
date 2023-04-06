import { App } from "../App";
import type { StaticRouteProps } from "@impalajs/core";

export default async function Hello({
	path,
	routeData,
	assets,
}: StaticRouteProps<typeof import("./hello.data")> & {
	assets?: Array<string>;
}) {
	const hounds = await fetch("https://dog.ceo/api/breed/hound/list").then(
		(res) => res.json(),
	);

	return (
		<App title="Hounds" assets={assets}>
			<ul>
				{hounds.message.map((hound: string) => (
					<li key={hound}>{hound}</li>
				))}
			</ul>
		</App>
	);
}
