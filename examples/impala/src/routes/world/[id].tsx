import { DynamicRouteProps } from "@impalajs/core";
import { App } from "../../App";

export default function Hello({
	path,
	params,
	data,
	assets,
}: DynamicRouteProps<typeof import("./[id].data")> & {
	assets?: Array<string>;
}) {
	return (
		<App assets={assets}>
			<meta name="description" content={data.description || "A page"} />
			<title>{data.title || "Hello"}</title>
			<div>
				Hello {path} {params.id}!
			</div>
		</App>
	);
}
