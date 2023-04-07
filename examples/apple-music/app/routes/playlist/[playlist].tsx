import { A } from "flight-router";
import { PageProps } from "./[playlist].types";

export default function Playlist(props: PageProps) {
	return <div>{props.params.playlist}</div>;
}
