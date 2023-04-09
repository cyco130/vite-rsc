import React from "react";
import { collectStyles } from "./find-styles";

export const InlineStyles: React.FC<{ entries?: string[] }> = (import.meta.env
	.DEV
	? async function InlineStyles(props: { entries?: string[] }) {
			const { default: devServer } = await import("virtual:vite-dev-server");
			const styles = await collectStyles(
				devServer,
				props.entries ?? ["~/root.tsx?rsc"],
			);
			return (
				<>
					{Object.entries(styles ?? {}).map(([url, css]) => (
						<style
							key={url}
							dangerouslySetInnerHTML={{ __html: css }}
							suppressHydrationWarning={true}
						/>
					))}
				</>
			);
	  }
	: () => null) as unknown as React.FC<{ entries?: string[] }>;
