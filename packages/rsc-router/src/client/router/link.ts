"use client";
import React, { ReactNode } from "react";
import {
	LinkOptions,
	MatchRouteOptions,
	NoInfer,
	RegisteredRoutesInfo,
	ResolveRelativePath,
	RouteByPath,
	ToOptions,
	ValidFromPath,
} from "./types";

export interface LinkFn<
	Props extends {} = {},
	TDefaultFrom extends RegisteredRoutesInfo["routePaths"] = "/",
	TDefaultTo extends string = "",
> {
	<
		TFrom extends RegisteredRoutesInfo["routePaths"] = TDefaultFrom,
		TTo extends string = TDefaultTo,
	>(
		props: MakeLinkOptions<Props, TFrom, TTo> &
			React.RefAttributes<HTMLAnchorElement> &
			Props,
	): JSX.Element;
}

export type LinkPropsOptions<
	Props extends {} = {},
	TFrom extends RegisteredRoutesInfo["routePaths"] = "/",
	TTo extends string = "",
> = LinkOptions<RegisteredRoutesInfo, TFrom, TTo> & {
	// A function that returns additional props for the `active` state of this link. These props override other props passed to the link (`style`'s are merged, `className`'s are concatenated)
	activeProps?:
		| (React.AnchorHTMLAttributes<HTMLAnchorElement> & Props)
		| (() => React.AnchorHTMLAttributes<HTMLAnchorElement> & Props);
	// A function that returns additional props for the `inactive` state of this link. These props override other props passed to the link (`style`'s are merged, `className`'s are concatenated)
	inactiveProps?:
		| (React.AnchorHTMLAttributes<HTMLAnchorElement> & Props)
		| (() => React.AnchorHTMLAttributes<HTMLAnchorElement> & Props);
};

export type MakeUseMatchRouteOptions<
	TFrom extends RegisteredRoutesInfo["routePaths"] = "/",
	TTo extends string = "",
> = ToOptions<RegisteredRoutesInfo, TFrom, TTo> & MatchRouteOptions;

export type MakeMatchRouteOptions<
	TFrom extends RegisteredRoutesInfo["routePaths"] = "/",
	TTo extends string = "",
> = ToOptions<RegisteredRoutesInfo, TFrom, TTo> &
	MatchRouteOptions & {
		// If a function is passed as a child, it will be given the `isActive` boolean to aid in further styling on the element it returns
		children?:
			| ReactNode
			| ((
					params: RouteByPath<
						RegisteredRoutesInfo,
						ResolveRelativePath<TFrom, NoInfer<TTo>>
					>["__types"]["allParams"],
			  ) => ReactNode);
	};

export type MakeLinkPropsOptions<
	Props extends {} = {},
	TFrom extends ValidFromPath<RegisteredRoutesInfo> = "/",
	TTo extends string = "",
> = LinkPropsOptions<Props, TFrom, TTo> &
	React.AnchorHTMLAttributes<HTMLAnchorElement>;

export type MakeLinkOptions<
	Props extends {} = {},
	TFrom extends RegisteredRoutesInfo["routePaths"] = "/",
	TTo extends string = "",
> = LinkPropsOptions<Props, TFrom, TTo> &
	React.AnchorHTMLAttributes<HTMLAnchorElement> &
	Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
		// If a function is passed as a child, it will be given the `isActive` boolean to aid in further styling on the element it returns
		children?: ReactNode | ((state: { isActive: boolean }) => ReactNode);
	};
