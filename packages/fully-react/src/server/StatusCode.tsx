import { response } from "stream-react/request";

export function StatusCode(props: { code: number }) {
	const res = response();
	res.status = props.code;
	return null;
}
