export type PageProps = {
	params: Record<string, string>;
	searchParams: URLSearchParams;
	children?: React.ReactNode;
};
