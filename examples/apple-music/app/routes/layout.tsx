import { LayoutConfig, LayoutProps } from "./layout.types";

import { AppleMusicDemo } from "../apple-music-demo";
import { Assets } from "fully-react/assets";

export default async function Root({ children }: LayoutProps) {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<Assets />
			</head>
			<body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
				<AppleMusicDemo>{children}</AppleMusicDemo>
			</body>
		</html>
	);
}
