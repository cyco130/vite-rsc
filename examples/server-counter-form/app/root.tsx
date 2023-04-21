import "./root.css";

import { ErrorBoundary, ResetButton } from "fully-react/error-boundary";
import { getCount, increment } from "./api";

import { Assets } from "fully-react/assets";
import { Form } from "fully-react/form";

async function Counter() {
	return (
		<Form action={increment}>
			<div>{await getCount()}</div>
			<button>Increment</button>
		</Form>
	);
}

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
					<ErrorBoundary
						fallback={
							<div>
								Error<ResetButton>Reset</ResetButton>
							</div>
						}
					>
						<Counter />
					</ErrorBoundary>
				</div>
			</body>
		</html>
	);
}
