import { Assets } from "stream-react/assets";
import { LayoutProps } from "./(layout).types";
import { A } from "fully-react";

function Nav() {
	return (
		<header className="header">
			<nav className="inner">
				<A href="/">
					<strong>HN</strong>
				</A>
				<A href="/new">
					<strong>New</strong>
				</A>
				<A href="/show">
					<strong>Show</strong>
				</A>
				<A href="/ask">
					<strong>Ask</strong>
				</A>
				<A href="/job">
					<strong>Jobs</strong>
				</A>
				<a
					className="github"
					href="http://github.com/solidjs/solid"
					target="_blank"
					rel="noreferrer"
				>
					Built with React Server Components + Vite
				</a>
			</nav>
		</header>
	);
}

export default function Root({ children }: LayoutProps) {
	return (
		<html lang="en">
			<head>
				<title>SolidStart - Hacker News</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content="Hacker News Clone built with React Server Components"
				/>
				<Assets />
			</head>
			<body>
				<Nav />
				{children}
			</body>
		</html>
	);
}
