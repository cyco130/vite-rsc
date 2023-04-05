import Counter from "./Counter";
import { increment, getCount } from "./api";
import { component, InlineStyles, request } from "rsc-router/server";
import { getSession } from "rsc-auth";
import { SignInButton, SignOutButton } from "rsc-auth/components";
import { authOptions } from "./auth";
import { ErrorBoundary, ResetButton } from "rsc-router";

const Profile = component(async function Profile() {
	const user = await getSession(request(), authOptions);
	return user ? (
		<>
			<img src={user.user?.image ?? ""} />
			{user.user?.name}
			<SignOutButton>Sign Out</SignOutButton>
		</>
	) : (
		<SignInButton>Sign In</SignInButton>
	);
});

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
					<Profile />
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
