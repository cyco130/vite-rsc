import { increment, getCount } from "./api";
import { InlineStyles } from "flight-router/dev";
import { Form } from "stream-react/form";
import { ErrorBoundary, ResetButton } from "stream-react/error-boundary";

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
