import { A } from "flight-router";
import { PageProps } from "./[library].types";

export default function Playlist(props: PageProps) {
	return <div>{props.params.library}</div>;
}
