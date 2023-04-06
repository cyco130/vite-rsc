import { App } from "../App";
import type { StaticRouteProps } from "@impalajs/core";

export default function Hello({
	path,
	routeData,
	assets,
}: StaticRouteProps<typeof import("./hello.data")> & {
	assets?: Array<string>;
}) {
	return (
		<App title="Hello" assets={assets}>
			<div>
				<>
					{routeData?.msg} {path}!
				</>
			</div>
		</App>
	);
}
