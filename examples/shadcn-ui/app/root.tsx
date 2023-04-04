import { SearchPage } from "./SearchPage";
import { createRouter, PageProps } from "@vite-rsc/router/server";
import { Suspense } from "react";
import { A } from "@vite-rsc/router";
import Counter from "./Counter";
import { sayHello } from "./sayHello";
import { buttonVariants } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import "cal-sans";
import "./root.css";
import Page from "./page";
import { InlineStyles } from "@vite-rsc/router/server";

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
				<InlineStyles />
			</head>
			<body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
				{children}
			</body>
		</html>
	);
}

function Playground() {
	return (
		<>
			<A
				href="/"
				className={buttonVariants({
					variant: "destructive",
				})}
			>
				Search
			</A>{" "}
			| <A href="/infinite">Infinite</A> | <A href="/not-found">Not Found</A>
			<Counter initialCount={42} sayHello={sayHello} />
			<Popover>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Place content for the popover here.</PopoverContent>
			</Popover>
			<ContextMenu>
				<ContextMenuTrigger>Right click</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem>Profile</ContextMenuItem>
					<ContextMenuItem>Billing</ContextMenuItem>
					<ContextMenuItem>Team</ContextMenuItem>
					<ContextMenuItem>Subscription</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		</>
	);
}

export default createRouter([
	{
		path: "",
		component: Root,
		children: [
			{ index: true, component: Page },
			{ path: "/infinite", component: InfiniteChildren },
		],
	},
]);
