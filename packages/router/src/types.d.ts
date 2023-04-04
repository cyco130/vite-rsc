export type PageProps = {
	params: { [key: string]: string };
	searchParams: { [key: string]: string };
	children?: React.ReactNode;
	url: string;
	headers: { [key: string]: string };
};
