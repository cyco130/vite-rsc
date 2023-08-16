import Counter from "./Counter";
import { increment, getCount } from "./api";
import { Assets } from "fully-react/assets";
import "./root.css";

export default async function Root() {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<Assets />
			</head>
			<body>
				<div id="root">
					<Counter count={await getCount()} increment={increment} />
				</div>
			</body>
		</html>
	);
}
