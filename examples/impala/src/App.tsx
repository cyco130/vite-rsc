import React from "react";
import "./App.css";
import { LinkTag } from "./components/LinkTag";
import { InlineStyles, ReactRefreshScript } from "rsc-router/dev";

interface AppProps {
	title?: string;
	assets?: string[];
}

export const App: React.FC<React.PropsWithChildren<AppProps>> = ({
	children,
	title,
	assets,
}) => {
	return (
		<html lang="en">
			<head>
				{title ? <title>{title}</title> : null}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{assets?.map((asset) => (
					<LinkTag key={asset} file={asset} />
				))}
				{import.meta.env.DEV && (
					<>
						<InlineStyles entries={["/src/App.tsx?rsc"]} />
						<ReactRefreshScript />
					</>
				)}
			</head>
			<body>
				<div id="__impala">{children}</div>
			</body>
		</html>
	);
};
