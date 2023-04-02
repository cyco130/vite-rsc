"use client";

import { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

export default function A({
	href,
	...props
}: { href: string } & DetailedHTMLProps<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
>) {
	return (
		<a
			href={href}
			onClick={(e) => {
				if (e.defaultPrevented) return;
				e.preventDefault();

				window.router.push(href);
			}}
			{...props}
		/>
	);
}
