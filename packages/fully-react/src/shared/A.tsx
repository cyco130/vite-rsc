"use client";

import React, {
	AnchorHTMLAttributes,
	DetailedHTMLProps,
	useCallback,
} from "react";
import { useRouter } from "./useRouter";
import { LinkFn } from "../client/router/link";

function isCtrlEvent(e: React.MouseEvent) {
	return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function useAnchorProps(props: Parameters<LinkFn<{}>>[0]) {
	const router = useRouter();
	const href = props.href ?? "";
	// // const pathname = props.to ?? interpolatePath(props.to, props.params);
	// const isActive = router.url === href;

	const composeHandlers =
		(handlers: (undefined | ((e: any) => void))[]) =>
		(e: React.SyntheticEvent) => {
			if (e.persist) e.persist();
			handlers.filter(Boolean).forEach((handler) => {
				if (e.defaultPrevented) return;
				handler!(e);
			});
		};

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			if (
				!props.disabled &&
				!isCtrlEvent(e) &&
				!e.defaultPrevented &&
				(!props.target || props.target === "_self") &&
				e.button === 0
			) {
				e.preventDefault();

				// All is well? Navigate!
				router.push(href);
			}
		},
		[router, props.disabled, props.target],
	);

	const handleFocus = useCallback(
		(e: React.FocusEvent<HTMLAnchorElement>) => {
			router.preload(href);
		},
		[router],
	);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent<HTMLAnchorElement>) => {
			router.preload(href);
		},
		[router],
	);

	const handleMouseEnter = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			router.preload(href);
		},
		[router],
	);

	const handleMouseLeave = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			// router.cancelPreload(href);
		},
		[router],
	);

	return {
		...props,
		href,
		onClick: composeHandlers([props.onClick, handleClick]),
		onFocus: composeHandlers([props.onClick, handleFocus]),
		onTouchStart: composeHandlers([props.onClick, handleTouchStart]),
		onMouseEnter: composeHandlers([props.onClick, handleMouseEnter]),
		onMouseLeave: composeHandlers([props.onClick, handleMouseLeave]),
	} satisfies DetailedHTMLProps<
		AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	>;
}

export const A: LinkFn<{}> = function A({
	activeProps = {},
	inactiveProps = {},
	...props
}: {
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
	const anchorProps = useAnchorProps(props);
	const isActive = router.url === anchorProps.href;
	return <a {...anchorProps} {...(isActive ? activeProps : inactiveProps)} />;
};
