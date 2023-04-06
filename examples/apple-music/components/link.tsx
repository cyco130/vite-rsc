"use client";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { A, TypedLink, interpolatePath, useRouter } from "rsc-router";
import { buttonVariants } from "./ui/button";

export const Link: TypedLink<VariantProps<typeof buttonVariants>> = (
	props: React.ComponentProps<typeof A> &
		VariantProps<typeof buttonVariants> & {
			activeProps?: React.ComponentProps<typeof A>["activeProps"] &
				VariantProps<typeof buttonVariants>;
		} & any,
) => {
	const router = useRouter();
	const href = props.href ?? interpolatePath(props.to, props.params);
	const isActive = router.url === href;
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
