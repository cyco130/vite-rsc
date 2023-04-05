import Counter from "./Counter";
import { increment, getCount } from "./api";
import { InlineStyles } from "rsc-router/server";
import { ErrorBoundary, ResetButton } from "rsc-router";

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
						<Counter count={await getCount()} increment={increment} />
					</ErrorBoundary>
				</div>
			</body>
		</html>
	);
}
