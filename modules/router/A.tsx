"use client";

import { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { useRouter } from "./useRouter";

export default function A({
	href,
	...props
}: { href: string } & DetailedHTMLProps<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
>) {
	const router = useRouter();
	let className = [
		props.className,
		href === router.location.pathname ? "active" : undefined,
	]
		.filter(Boolean)
		.join(" ");

	console.log(className);
	return (
		<a
			href={href}
			onClick={(e) => {
				if (e.defaultPrevented) return;
				e.preventDefault();

				window.router.push(href);
			}}
			{...props}
			className={className}
		/>
	);
}
