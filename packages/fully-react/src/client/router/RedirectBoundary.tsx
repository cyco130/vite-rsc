"use client";

import React, { Component, startTransition, useEffect } from "react";
import {
	getURLFromRedirectError,
	isRedirectError,
} from "stream-react/navigation";
import { RouterAPI, useRouter } from "stream-react/router";

interface RedirectBoundaryProps {
	router: RouterAPI;
	children: React.ReactNode;
}

function HandleRedirect({
	redirect,
	reset,
}: {
	redirect: string;
	reset: () => void;
}) {
	const router = useRouter();

	useEffect(() => {
		startTransition(() => {
			router.replace(redirect, {});
			reset();
		});
	}, [redirect, reset, router]);

	return null;
}

export class RedirectErrorBoundary extends Component<
	RedirectBoundaryProps,
	{ redirect: string | null }
> {
	constructor(props: RedirectBoundaryProps) {
		super(props);
		this.state = { redirect: null };
	}

	static getDerivedStateFromError(error: any) {
		if (isRedirectError(error)) {
			const url = getURLFromRedirectError(error);
			return { redirect: url };
		}
		// Re-throw if error is not for redirect
		throw error;
	}

	render() {
		const redirect = this.state.redirect;
		if (redirect !== null) {
			return (
				<HandleRedirect
					redirect={redirect}
					reset={() => this.setState({ redirect: null })}
				/>
			);
		}

		return this.props.children;
	}
}

export function RedirectBoundary({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	return (
		<RedirectErrorBoundary router={router}>{children}</RedirectErrorBoundary>
	);
}
