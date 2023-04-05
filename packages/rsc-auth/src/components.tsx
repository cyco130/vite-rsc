"use client";

import React from "react";
import { signIn, signOut } from "./client";

export function SignInButton({
	children,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button {...props} onClick={() => signIn("github")}>
			{children}
		</button>
	);
}

export function SignOutButton({
	children,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button {...props} onClick={() => signOut()}>
			{children}
		</button>
	);
}
