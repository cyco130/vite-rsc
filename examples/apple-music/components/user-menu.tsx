"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	CreditCard,
	Keyboard,
	LogOut,
	Mail,
	MessageSquare,
	PlusCircle,
	Settings,
	User,
	UserPlus,
	Users,
} from "lucide-react";
import { DemoIndicator } from "../app/apple-music-demo";
import { signOut } from "rsc-auth/client";

export function UserDropdownMenu({ user, children }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					{children}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard className="mr-2 h-4 w-4" />
						<span>Billing</span>
						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Keyboard className="mr-2 h-4 w-4" />
						<span>Keyboard shortcuts</span>
						<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Users className="mr-2 h-4 w-4" />
						<span>Team</span>
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<UserPlus className="mr-2 h-4 w-4" />
							<span>Invite users</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent forceMount>
								<DropdownMenuItem>
									<Mail className="mr-2 h-4 w-4" />
									<span>Email</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<MessageSquare className="mr-2 h-4 w-4" />
									<span>Message</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<PlusCircle className="mr-2 h-4 w-4" />
									<span>More...</span>
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={(e) => signOut()}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
					<DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
