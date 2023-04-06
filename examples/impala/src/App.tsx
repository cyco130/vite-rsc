import React from "react";
import "./App.css";

interface AppProps {
	title?: string;
}

export const App: React.FC<React.PropsWithChildren<AppProps>> = ({
	children,
	title,
}) => {
	return (
		<html lang="en">
			<head>
				{title ? <title>{title}</title> : null}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body>{children}</body>
		</html>
	);
};
