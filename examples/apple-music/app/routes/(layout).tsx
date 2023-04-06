import { PageProps } from "rsc-router";
import { InlineStyles, ReactRefreshScript } from "rsc-router/server";
import { AppleMusicDemo } from "../apple-music-demo";

export default async function Root({ children }: PageProps) {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<ReactRefreshScript />
				<InlineStyles />
			</head>
			<body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
				<AppleMusicDemo>{children}</AppleMusicDemo>
			</body>
		</html>
	);
}

// export default createRouter([
// 	{
// 		path: "",
// 		component: Root,
// 		children: [
// 			{ index: true, component: ListenNow },
// 			{ path: "/browse", component: Browse },
// 			{ path: "/radio", component: ListenNow },
// 			{ path: "/library/playlists", component: ListenNow },
// 			{ path: "/library/songs", component: ListenNow },
// 			{ path: "/library/made-for-you", component: ListenNow },
// 			{ path: "/library/artists", component: ListenNow },
// 			{ path: "/library/albums", component: ListenNow },
// 			{ path: "/playlist/:playlist", component: ListenNow },
// 		],
// 	},
// ]);
