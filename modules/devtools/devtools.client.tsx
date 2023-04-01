import { createRoot } from "react-dom/client";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { useRef, useState, useEffect, CSSProperties } from "react";
import * as Comlink from "comlink";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query";

const store = create(combine({ open: false }, (set) => ({})));

function DevtoolsPanel() {
	const { open } = store();
	const [state, setState] = useState({
		width: 800,
		height: 300,
	});
	return open ? (
		<Resizable
			{...state}
			onResize={(el, { size }) => setState(size)}
			resizeHandles={["nw", "ne", "w", "e", "n"]}
		>
			<div
				style={{
					outline: "none",
					border: "none",
					height: state.height + "px",
					width: state.width + "px",
					position: "fixed",
					zIndex: 1213213123,
					borderRadius: "0.5rem",
					left: "50%",
					bottom: "2vh",
					transform: "translateX(-50%)",
				}}
				className="vite-devtools-frame"
			>
				<Devtools
					style={{
						height: state.height + "px",
						width: state.width + "px",
					}}
				/>
			</div>
		</Resizable>
	) : null;
}

export function Devtools({ style }: { style: CSSProperties }) {
	const ref = useRef<HTMLIFrameElement>();
	const [link, setLink] = useState(null as any);
	const [moduleView, setModuleView] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			let link = await Comlink.wrap(
				Comlink.windowEndpoint(ref.current!.contentWindow as Window),
			);
			setLink(() => link);
		})();
	}, [setLink, ref]);

	return (
		<>
			<iframe
				// @ts-expect-error
				allowtransparency="true"
				ref={(el) => {
					if (el && ref.current != el) {
						ref.current = el;
						console.log(el);
						console.log("exposing");
						Comlink.expose(
							{
								setModuleView: (el) => {
									console.log(el);
									setModuleView(el);
								},
							} satisfies ClientRPC,
							Comlink.windowEndpoint(el.contentWindow as Window),
						);
					}
				}}
				style={{
					...style,
					borderRadius: "0.5rem",
					outline: "none",
					border: "none",
				}}
				src={"/__devtools"}
			/>
			<button onClick={() => link()}>click</button>
			{moduleView ? <ModuleView style={style} /> : null}
		</>
	);
}

function ModuleView({ style }: { style: CSSProperties }) {
	return (
		<div
			style={{
				position: "absolute",
				left: "50px",
				top: "0",
			}}
		>
			<QueryClientProvider client={queryClient}>
				<ReactQueryDevtoolsPanel
					isOpen={true}
					setIsOpen={() => {}}
					style={{
						height: style.height,
						overflow: "hidden",
						borderTopRightRadius: "0.5rem",
						borderBottomRightRadius: "0.5rem",
						width: `calc(${style.width} - 50px)`,
					}}
					onDragStart={() => {}}
				/>
			</QueryClientProvider>
		</div>
	);
}

function togglePanel() {
	console.log("togglePanel");
	store.setState({ open: !store.getState().open });
}

export default function mount() {
	if (typeof document === "undefined" || typeof window === "undefined") return;

	if (window.parent && window.self !== window.parent) {
		try {
			if (window.parent.document.querySelector("#vite-devtools-container"))
				return;
		} catch (e) {}
	}

	// const client: NuxtDevtoolsHostClient = markRaw({
	//   nuxt: markRaw(nuxt as any),
	//   appConfig: useAppConfig() as any,
	//   hooks: createHooks(),
	//   getClientHooksMetrics: () => Object.values(clientHooks),
	//   closeDevTools: closePanel,
	// });

	const holder = document.createElement("div");
	holder.id = "vite-devtools-container";
	holder.setAttribute("data-v-inspector-ignore", "true");
	document.body.appendChild(holder);

	// Shortcut to toggle devtools
	addEventListener("keypress", (e) => {
		if (e.code === "KeyD" && e.ctrlKey) togglePanel();
	});

	createRoot(holder).render(<DevtoolsPanel />);
}

if (import.meta.env.DEV) {
	mount();
}
