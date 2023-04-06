import { A } from "rsc-router";
import { PageProps } from "./[playlist].types";

export default function Playlist(props: PageProps) {
	return (
		<div>
			<A
				to="/:library"
				params={{
					library: "2",
				}}
				search={{
					page: 1,
					page2: 2,
				}}
			/>
			{props.params.playlist}
		</div>
	);
}
