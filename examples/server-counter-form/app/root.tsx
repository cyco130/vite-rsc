import { increment, getCount } from "./api";
import { InlineStyles } from "rsc-router/server";
import { ErrorBoundary, ResetButton, Form } from "rsc-router";

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
				<InlineStyles />
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
