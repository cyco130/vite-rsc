import Counter from "./Button";
import { sayHello } from "./api";
import { getSession as getAuthSession } from "rsc-auth";
import { SignInButton, SignOutButton } from "rsc-auth/components";
import { authOptions } from "./auth";
import { ErrorBoundary, ResetButton } from "fully-react/error-boundary";
import { request } from "fully-react/request";
import { component } from "fully-react/server";
import { Assets } from "fully-react/assets";
import Button from "./Button";
import { cache } from "react";

const getSession = cache(async () => {
	console.log("getSession");
	return await getAuthSession(request(), authOptions);
});

const Profile = component(async function Profile() {
	const user = await getSession();
	return user ? (
		<>
			<img src={user.user?.image ?? ""} />
			{user.user?.name}
			<SignOutButton>Sign Out!!</SignOutButton>
		</>
	) : (
		<SignInButton>Sign In</SignInButton>
	);
});

export default async function Root() {
	const user = await getSession();
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
					<Profile />
					<ErrorBoundary
						fallback={
							<div>
								Error<ResetButton>Reset</ResetButton>
							</div>
						}
					>
						<Button onClick={sayHello} />
					</ErrorBoundary>
				</div>
			</body>
		</html>
	);
}
