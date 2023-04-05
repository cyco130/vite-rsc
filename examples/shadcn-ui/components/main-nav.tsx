import * as React from "react";

import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { A } from "rsc-router";

interface MainNavProps {
	items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
	return (
		<div className="flex gap-6 md:gap-10">
			<A href="/" className="hidden items-center space-x-2 md:flex">
				<Icons.logo className="h-6 w-6" />
				<span className="hidden font-bold sm:inline-block">
					{siteConfig.name}
				</span>
			</A>
			{items?.length ? (
				<nav className="hidden gap-6 md:flex">
					{items?.map(
						(item, index) =>
							item.href && (
								<A
									key={index}
									href={item.href}
									className={cn(
										"flex items-center text-lg font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-100 sm:text-sm",
										item.disabled && "cursor-not-allowed opacity-80",
									)}
								>
									{item.title}
								</A>
							),
					)}
				</nav>
			) : null}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="-ml-4 text-base hover:bg-transparent focus:ring-0 md:hidden"
					>
						<Icons.logo className="mr-2 h-4 w-4" />{" "}
						<span className="font-bold">Menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					sideOffset={24}
					className="w-[300px] overflow-scroll"
				>
					<DropdownMenuLabel>
						<A href="/" className="flex items-center">
							<Icons.logo className="mr-2 h-4 w-4" /> {siteConfig.name}
						</A>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{items?.map(
						(item, index) =>
							item.href && (
								<DropdownMenuItem key={index} asChild>
									<A href={item.href}>{item.title}</A>
								</DropdownMenuItem>
							),
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
