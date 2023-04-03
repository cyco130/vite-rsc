"use client";

import React, { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { useRouter } from "./useRouter";

export default function A({
	href,
	...props
}: { href: string } & DetailedHTMLProps<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
>) {
	const router = useRouter();
	return (
		<a
			href={href}
			onClick={(e) => {
				if (e.defaultPrevented) return;
				e.preventDefault();
				router.push(href);
			}}
			{...props}
		/>
	);
}
