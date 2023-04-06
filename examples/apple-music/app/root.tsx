import { PageProps } from "rsc-router";
import { createRouter, InlineStyles } from "rsc-router/server";
import { Suspense } from "react";
import HomePage from "./home";
import { AppleMusicDemo } from "./apple-music-demo";
import { ListenNow } from "./ListenNow";

import "cal-sans";
import "./root.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCount, increment } from "./actions";
import { Form } from "rsc-router";
import FormDemo from "./form";

const InfiniteChildren: any = async ({ level = 0 }) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return (
		<div
			style={{ border: "1px red dashed", margin: "0.1em", padding: "0.1em" }}
		>
			<div>Level {level}</div>
			<Suspense fallback="Loading...">
				<InfiniteChildren level={level + 1} />
			</Suspense>
		</div>
	);
};

async function Root({ children }: PageProps) {
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<script
					type="module"
					dangerouslySetInnerHTML={{
						__html: `
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`,
					}}
				></script>
				<InlineStyles />
			</head>
			<body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
				<AppleMusicDemo>{children}</AppleMusicDemo>
			</body>
		</html>
	);
}

async function Browse() {
	return (
		<div>
			<Form action={increment}>
				<div>{await getCount()}</div>
				<Button>Increment</Button>
			</Form>
			<FormDemo>
				<Form.ActionId action={increment} />
			</FormDemo>
		</div>
	);
}

export default createRouter([
	{
		path: "",
		component: Root,
		children: [
			{ index: true, component: ListenNow },
			{ path: "/browse", component: Browse },
			{ path: "/radio", component: ListenNow },
			{ path: "/library/playlists", component: ListenNow },
			{ path: "/library/songs", component: ListenNow },
			{ path: "/library/made-for-you", component: ListenNow },
			{ path: "/library/artists", component: ListenNow },
			{ path: "/library/albums", component: ListenNow },
			{ path: "/playlist/:playlist", component: ListenNow },
		],
	},
]);
