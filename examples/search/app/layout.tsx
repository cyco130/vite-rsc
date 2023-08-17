import React from "react";
import { A } from "fully-react/app-router";
import { Assets } from "fully-react/assets";

const Layout = (React.FC<React.PropsWithChildren> = ({
	children,
	title,
}: {
	children: any;
	title?: any;
}) => {
	return (
		<html lang="en">
			<head>
				<title>{title ?? "RSC Playground"}</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<Assets />
			</head>
			<body>
				<A href="/">Search</A> | <A href="/not-found">Not Found</A>
				<div id="root">{children}</div>
			</body>
		</html>
	);
});

export default Layout;
