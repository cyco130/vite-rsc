"use client";

import { A, TypedLink, interpolatePath } from "fully-react/app-router";

import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "fully-react/router";

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
			href={href}
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
