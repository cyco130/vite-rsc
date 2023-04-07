"use client";
import React from "react";
import { useErrorBoundary } from "react-error-boundary";

export { ErrorBoundary } from "react-error-boundary";

export function ResetButton({
	children,
	...props
}: React.ComponentProps<"button">) {
	const errorBoundary = useErrorBoundary();
	return (
		<button onClick={() => errorBoundary.resetBoundary()} {...props}>
			{children}
		</button>
	);
}
