"use client";

import { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { useRouter } from "./useRouter";
import { LinkFn } from "./link";

export const A: LinkFn = function A({
	href,
	activeProps = {},
	...props
}: {
	href: string;
	activeProps?: DetailedHTMLProps<
		AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	>;
} & DetailedHTMLProps<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
> &
	any) {
	const router = useRouter();
	const isActive = router.url === href;
	return (
		<a
			href={href}
			onClick={(e) => {
				if (e.defaultPrevented) return;
				e.preventDefault();
				router.push(href);
			}}
			{...props}
			{...(isActive ? activeProps : {})}
		/>
	);
};
