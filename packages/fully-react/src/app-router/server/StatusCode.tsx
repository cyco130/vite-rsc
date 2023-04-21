import { response } from "../../server/request";

export function StatusCode(props: { code: number }) {
	const res = response();
	res.status = props.code;
	return null;
}
