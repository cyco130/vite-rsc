import { DynamicRouteProps } from "@impalajs/core";
import { App } from "../../App";

export default function Hello({
	path,
	params,
	data,
}: DynamicRouteProps<typeof import("./[id].data")>) {
	return (
		<App>
			<meta name="description" content={data.description || "A page"} />
			<title>{data.title || "Hello"}</title>
			<div>
				Hello {path} {params.id}!
			</div>
		</App>
	);
}
