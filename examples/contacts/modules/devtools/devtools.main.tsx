import { createRoot } from "react-dom/client";
import {
	createBrowserRouter,
	Navigate,
	Outlet,
	RouterProvider,
	useParams,
} from "react-router-dom";
// import { createRPCClient } from "vite-dev-rpc";
// import type { ClientFunctions, ServerFunctions } from "./rpc";
import * as Comlink from "comlink";
import { useLayoutEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./utils";
import "@unocss/reset/tailwind.css";
import "uno.css";

// const rpc = createRPCClient<ServerFunctions, ClientFunctions>(
// 	"demo",
// 	import.meta.hot,
// 	{
// 		alert(message) {},
// 	},
// );

type Tab = {
	name: string;
	icon: string;
	view:
		| {
				type: "iframe";
				url: string;
		  }
		| {
				type: "component";
				component: string;
		  }
		| {
				type: "jsx";
				jsx: JSX.Element;
		  };
};

let modules: Tab[] = [
	{
		name: "overview",
		icon: "carbon-information",
		view: {
			type: "jsx",
			jsx: <div>overview</div>,
		},
	},
	{
		name: "inspect",
		icon: "ic-sharp-manage-search",
		view: {
			type: "iframe",
			url: "/__inspect",
		},
	},
	{
		name: "react-query",
		icon: "simple-icons-reactquery",
		view: {
			type: "component",
			component: "ReactQueryDevtools",
		},
	},
	{
		name: "icones",
		icon: "carbon-airport-location",
		view: {
			type: "iframe",
			url: "https://icones.js.org/collection/all",
		},
	},
];

function App() {
	const [tabs, setTabs] = useState({
		builtin: {
			value: modules,
		},
		custom: { value: [] },
	});
	const [client, setClient] = useState(true);

	return (
		<div className="n-border-base flex-gap-[0.5] flex h-full flex-col items-center border-r">
			<div className="text-secondary sticky top-0 z-10 mb-2 flex flex-col items-center pt-3">
				<button
					className={cn(
						`h-6 w-6 text-lg i-logos-vitejs`,
						client ? "" : "saturate-0",
					)}
					title={
						client
							? "Nuxt DevTools"
							: "DevTools Client not connected, try open it in iframe mode"
					}
				></button>

				<div className="h-1px n-border-base mt-2 w-8 border-b" />
			</div>

			<div className="flex flex-col space-y-1">
				{tabs.builtin.value.map((tab) => (
					<SideNavItem key={tab.name} tab={tab} />
				))}
				{/* {tabs.custom.value.length ? (
					<>
						<div className="h-1px n-border-base my-1 w-8 border-b" />
						{tabs.custom.value.map((tab) => (
							<SideNavItem key={tab.name} tab={tab} />
						))}
						<div className="flex-auto" />
					</>
				) : null} */}
			</div>
		</div>
	);
}

function MyIcon(props: { icon?: string; title?: string }) {
	const { icon, title, ...attrs } = props;

	return icon && (icon.startsWith("/") || icon.match(/^https?:/)) ? (
		<img {...attrs} className="h-5 w-5" src={icon} alt={title} />
	) : (
		<div
			{...attrs}
			className={`h-5 w-5 ${icon || "carbon-bring-forward"}`}
			title={title}
		/>
	);
}

function SideNavItem({ tab }: { tab: Tab }) {
	return (
		<NavLink
			to={`/${tab.name}`}
			// ="!text-primary bg-active"
			className={({ isActive }) =>
				cn(
					"hover:n-bg-active text-secondary flex h-9 w-9 items-center justify-center rounded-xl px-1",
					isActive && "n-bg-active text-primary",
				)
			}
			aria-current="page"
		>
			<MyIcon icon={tab.icon} />
		</NavLink>
	);
}

let proxy = await Comlink.wrap<ClientRPC>(Comlink.windowEndpoint(self.parent));

function ProxyModuleView({ component }: { component: string }) {
	useLayoutEffect(() => {
		proxy.setModuleView(component).then(() => {
			console.log();
		});

		return () => {
			proxy.setModuleView(null);
		};
	}, []);
	return <></>;
}

function IFrameView({ url }: { url: string }) {
	return <iframe src={url} className="h-full w-full" />;
}

function ModuleView() {
	const { module: mod } = useParams();
	let resolved = modules.find((m) => m.name === mod);

	if (!resolved) {
		return <div>Module not found</div>;
	}

	if (resolved.view?.type === "component") {
		return <ProxyModuleView component={resolved.view.component} />;
	} else if (resolved.view?.type === "iframe") {
		return <IFrameView url={resolved.view.url} />;
	}
	return <div>{mod}</div>;
}

const router = createBrowserRouter(
	[
		{
			path: "/",
			element: (
				<div className=" glass-effect grid h-screen w-screen grid-cols-[50px_1fr]">
					<App />
					<Outlet />
				</div>
			),
			children: [
				{
					index: true,
					element: <Navigate to="overview" />,
				},
				{
					path: ":module",
					element: <ModuleView />,
				},
			],
		},
	],
	{
		basename: "/__devtools",
	},
);

Comlink.expose(
	() => console.log("hello from iframe"),
	Comlink.windowEndpoint(self.parent),
);

const devtoolsElement = document.getElementById("devtools");
if (!devtoolsElement) {
	throw new Error("devtools element not found");
}

createRoot(devtoolsElement).render(<RouterProvider router={router} />);
