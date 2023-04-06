import { LayoutConfig, LayoutProps } from "./(layout).types";

export default function PlaylistLayout({
	children,
	searchParams,
	params,
}: LayoutProps) {
	return <>{children}</>;
}

export const config = {
	validateSearch: (search) => {
		return {
			page2: Number(search?.page ?? 1),
		};
	},
} satisfies LayoutConfig;
