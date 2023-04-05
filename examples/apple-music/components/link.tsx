"use client";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { A, useRouter } from "rsc-router";
import { buttonVariants } from "./ui/button";

export const Link = (
	props: React.ComponentProps<typeof A> &
		VariantProps<typeof buttonVariants> & {
			activeProps?: React.ComponentProps<typeof A>["activeProps"] &
				VariantProps<typeof buttonVariants>;
		},
) => {
	const router = useRouter();
	const isActive = props.href === router.url;
	console.log(props.href, router.url);
	return (
		<A
			{...props}
			className={cn(
				buttonVariants({
					variant: props.variant,
					size: props.size,
					className: props.className,
					...(isActive ? props.activeProps : {}),
				}),
			)}
		/>
	);
};
