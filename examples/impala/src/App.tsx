import React from "react";
import "./App.css";
import { Asset } from "fully-react/assets";
import { InlineStyles } from "fully-react/dev";

interface AppProps {
	title?: string;
	assets?: string[];
}

function Links({
	assets,
}: {
	assets?: (string | { type: "style"; style: string })[];
}) {
	return (
		<>
			{assets?.map((asset) =>
				typeof asset === "string" ? (
					<Asset key={asset} file={asset} />
				) : (
					<style
						key={asset.style}
						dangerouslySetInnerHTML={{ __html: asset.style }}
					/>
				),
			)}
		</>
	);
}

// const Assets = component(async function Assets({
// 	entries,
// }: {
// 	entries: string[];
// }) {
// 	let assets = Array.from(
// 		new Set(
// 			(
// 				await Promise.all(
// 					entries.map(async (entry) => {
// 						let assets = await globalThis.findAssets(entry);
// 						return assets;
// 					}),
// 				)
// 			).flat(),
// 		).values(),
// 	);

// 	console.log(assets);

// 	return <AssetsLinks assets={assets} />;
// });

function DevAssets() {
	return import.meta.env.DEV ? <InlineStyles /> : null;
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
				<Links assets={assets} />
				<DevAssets />
			</head>
			<body>
				<div id="__impala">
					<div>
						<a href="/">Home</a> | <a href="/hello">Hello</a> |{" "}
						<a href="/world/1">World 1</a>
					</div>
					{children}
				</div>
			</body>
		</html>
	);
};
