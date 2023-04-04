import { NavItem } from "@/types/nav";

interface SiteConfig {
	name: string;
	description: string;
	mainNav: NavItem[];
	links: {
		twitter: string;
		github: string;
		docs: string;
	};
}

export const siteConfig: SiteConfig = {
	name: "Vite React Server",
	description:
		"Beautifully designed components built with Radix UI and Tailwind CSS rendered with React Server Components and Vite.",
	mainNav: [
		{
			title: "Home",
			href: "/",
		},
	],
	links: {
		twitter: "https://twitter.com/shadcn",
		github: "https://github.com/shadcn/ui",
		docs: "https://ui.shadcn.com",
	},
};
