import { A } from "rsc-router";
import { PageProps } from "./[playlist].types";

export default function Playlist(props: PageProps) {
	return (
		<div>
			<A
				to=''
				params={{
					playlist: "2",
				}}
				search={{
					page: 1,
				}}
			/>
			{props.params.playlist}
		</div>
	);
}
