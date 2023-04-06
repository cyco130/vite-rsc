import * as React from "react";

import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Globe,
	LayoutGrid,
	Library,
	ListMusic,
	Mic,
	Mic2,
	Music,
	Music2,
	PlayCircle,
	PlusCircle,
	Radio,
	User,
} from "lucide-react";
import { Link } from "@/components/link";
import { A } from "rsc-router";

const playlists = [
	"Recently Added",
	"Recently Played",
	"Top Songs",
	"Top Albums",
	"Top Artists",
	"Logic Discography",
	"Bedtime Beats",
	"Feeling Happy",
	"I miss Y2K Pop",
	"Runtober",
	"Mellow Days",
	"Eminem Essentials",
];

interface Album {
	name: string;
	artist: string;
	cover: string;
}

export const listenNowAlbums: Album[] = [
	{
		name: "Async Awakenings",
		artist: "Nina Netcode",
		cover:
			"https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?w=300&dpr=2&q=80",
	},
	{
		name: "The Art of Reusability",
		artist: "Lena Logic",
		cover:
			"https://images.unsplash.com/photo-1576075796033-848c2a5f3696?w=300&dpr=2&q=80",
	},
	{
		name: "Stateful Symphony",
		artist: "Beth Binary",
		cover:
			"https://images.unsplash.com/photo-1606542758304-820b04394ac2?w=300&dpr=2&q=80",
	},
	{
		name: "React Rendezvous",
		artist: "Ethan Byte",
		cover:
			"https://images.unsplash.com/photo-1598295893369-1918ffaf89a2?w=300&dpr=2&q=80",
	},
];

export const madeForYouAlbums: Album[] = [
	{
		name: "Async Awakenings",
		artist: "Nina Netcode",
		cover:
			"https://images.unsplash.com/photo-1580428180098-24b353d7e9d9?w=300&dpr=2&q=80",
	},
	{
		name: "Stateful Symphony",
		artist: "Beth Binary",
		cover:
			"https://images.unsplash.com/photo-1606542758304-820b04394ac2?w=300&dpr=2&q=80",
	},
	{
		name: "The Art of Reusability",
		artist: "Lena Logic",
		cover:
			"https://images.unsplash.com/photo-1626759486966-c067e3f79982?w=300&dpr=2&q=80",
	},
	{
		name: "Thinking Components",
		artist: "Lena Logic",
		cover:
			"https://images.unsplash.com/photo-1576075796033-848c2a5f3696?w=300&dpr=2&q=80",
	},
	{
		name: "Functional Fury",
		artist: "Beth Binary",
		cover:
			"https://images.unsplash.com/photo-1606542758304-820b04394ac2?w=300&dpr=2&q=80",
	},
	{
		name: "React Rendezvous",
		artist: "Ethan Byte",
		cover:
			"https://images.unsplash.com/photo-1598295893369-1918ffaf89a2?w=300&dpr=2&q=80",
	},
];

export function Nav() {
	return (
		<aside className="pb-12">
			<div className="px-8 py-6">
				<p className="flex items-center text-2xl font-semibold tracking-tight">
					<Music className="mr-2" />
					Music
				</p>
			</div>
			<div className="space-y-4">
				<div className="px-6 py-2">
					<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
						Discover
					</h2>
					<div className="space-y-1">
						<Link
							variant="ghost"
							activeProps={{
								variant: "subtle",
							}}
							size="sm"
							className="w-full justify-start"
							href="/"
						>
							<PlayCircle className="mr-2 h-4 w-4" />
							Listen Now
						</Link>
						<Link
							variant="ghost"
							activeProps={{
								variant: "subtle",
							}}
							size="sm"
							className="w-full justify-start"
							href="/browse"
						>
							<LayoutGrid className="mr-2 h-4 w-4" />
							Browse
						</Link>
						<Link
							href="/radio"
							variant="ghost"
							activeProps={{
								variant: "subtle",
							}}
							size="sm"
							className="w-full justify-start"
						>
							<Radio className="mr-2 h-4 w-4" />
							Radio
						</Link>
					</div>
				</div>
				<div className="px-6 py-2">
					<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
						Library
					</h2>
					<div className="space-y-1">
						<Link
							href="/library/playlists"
							variant="ghost"
							activeProps={{ variant: "subtle" }}
							size="sm"
							className="w-full justify-start"
						>
							<ListMusic className="mr-2 h-4 w-4" />
							Playlists
						</Link>
						<Link
							href="/library/songs"
							variant="ghost"
							activeProps={{ variant: "subtle" }}
							size="sm"
							className="w-full justify-start"
						>
							<Music2 className="mr-2 h-4 w-4" />
							Songs
						</Link>
						<Link
							href="/library/made-for-you"
							variant="ghost"
							activeProps={{ variant: "subtle" }}
							size="sm"
							className="w-full justify-start"
						>
							<User className="mr-2 h-4 w-4" />
							Made for You
						</Link>
						<Link
							href="/library/artists"
							variant="ghost"
							activeProps={{ variant: "subtle" }}
							size="sm"
							className="w-full justify-start"
						>
							<Mic2 className="mr-2 h-4 w-4" />
							Artists
						</Link>
						<Link
							href="/library/albums"
							variant="ghost"
							activeProps={{ variant: "subtle" }}
							size="sm"
							className="w-full justify-start"
						>
							<Library className="mr-2 h-4 w-4" />
							Albums
						</Link>
					</div>
				</div>
				<div>
					<h2 className="relative px-8 text-lg font-semibold tracking-tight">
						Playlists <DemoIndicator className="right-28" />
					</h2>
					<ScrollArea className="h-[230px] px-4 py-2">
						<div className="space-y-1 p-2">
							{playlists.map((playlist) => (
								<Link
									to={"/playlist/:playlist"}
									params={{
										playlist: encodeURIComponent(playlist),
									}}
									variant="ghost"
									activeProps={{
										variant: "subtle",
									}}
									size="sm"
									className="w-full justify-start font-normal"
									key={playlist}
								>
									<ListMusic className="mr-2 h-4 w-4" />
									{playlist}
								</Link>
							))}
						</div>
					</ScrollArea>
				</div>
			</div>
		</aside>
	);
}

export function AppleMusicDemo({ children }: { children?: React.ReactNode }) {
	return (
		<div className="overflow-hidden rounded-md border border-slate-200 bg-gradient-to-b from-rose-500 to-indigo-700 shadow-2xl dark:border-slate-800 h-screen flex flex-col">
			<Menubar className="rounded-none border-b border-none dark:bg-slate-900">
				<MenubarMenu>
					<MenubarTrigger className="font-bold">Music</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>About Music</MenubarItem>
						<MenubarSeparator />
						<MenubarItem>
							Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem>
							Hide Music... <MenubarShortcut>⌘H</MenubarShortcut>
						</MenubarItem>
						<MenubarItem>
							Hide Others... <MenubarShortcut>⇧⌘H</MenubarShortcut>
						</MenubarItem>
						<MenubarShortcut />
						<MenubarItem>
							Quit Music <MenubarShortcut>⌘Q</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger className="relative">
						File
						<DemoIndicator />
					</MenubarTrigger>
					<MenubarContent>
						<MenubarSub>
							<MenubarSubTrigger>New</MenubarSubTrigger>
							<MenubarSubContent className="w-[230px]">
								<MenubarItem>
									Playlist <MenubarShortcut>⌘N</MenubarShortcut>
								</MenubarItem>
								<MenubarItem disabled>
									Playlist from Selection <MenubarShortcut>⇧⌘N</MenubarShortcut>
								</MenubarItem>
								<MenubarItem>
									Smart Playlist... <MenubarShortcut>⌥⌘N</MenubarShortcut>
								</MenubarItem>
								<MenubarItem>Playlist Folder</MenubarItem>
								<MenubarItem disabled>Genius Playlist</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
						<MenubarItem>
							Open Stream URL... <MenubarShortcut>⌘U</MenubarShortcut>
						</MenubarItem>
						<MenubarItem>
							Close Window <MenubarShortcut>⌘W</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarSub>
							<MenubarSubTrigger>Library</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarItem>Update Cloud Library</MenubarItem>
								<MenubarItem>Update Genius</MenubarItem>
								<MenubarSeparator />
								<MenubarItem>Organize Library...</MenubarItem>
								<MenubarItem>Export Library...</MenubarItem>
								<MenubarSeparator />
								<MenubarItem>Import Playlist...</MenubarItem>
								<MenubarItem disabled>Export Playlist...</MenubarItem>
								<MenubarItem>Show Duplicate Items</MenubarItem>
								<MenubarSeparator />
								<MenubarItem>Get Album Artwork</MenubarItem>
								<MenubarItem disabled>Get Track Names</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
						<MenubarItem>
							Import... <MenubarShortcut>⌘O</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled>Burn Playlist to Disc...</MenubarItem>
						<MenubarSeparator />
						<MenubarItem>
							Show in Finder <MenubarShortcut>⇧⌘R</MenubarShortcut>{" "}
						</MenubarItem>
						<MenubarItem>Convert</MenubarItem>
						<MenubarSeparator />
						<MenubarItem>Page Setup...</MenubarItem>
						<MenubarItem disabled>
							Print... <MenubarShortcut>⌘P</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>Edit</MenubarTrigger>
					<MenubarContent>
						<MenubarItem disabled>
							Undo <MenubarShortcut>⌘Z</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled>
							Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem disabled>
							Cut <MenubarShortcut>⌘X</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled>
							Copy <MenubarShortcut>⌘C</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled>
							Paste <MenubarShortcut>⌘V</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem>
							Select All <MenubarShortcut>⌘A</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled>
							Deselect All <MenubarShortcut>⇧⌘A</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem>
							Smart Dictation...{" "}
							<MenubarShortcut>
								<Mic className="h-4 w-4" />
							</MenubarShortcut>
						</MenubarItem>
						<MenubarItem>
							Emoji & Symbols{" "}
							<MenubarShortcut>
								<Globe className="h-4 w-4" />
							</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarCheckboxItem>Show Playing Next</MenubarCheckboxItem>
						<MenubarCheckboxItem checked>Show Lyrics</MenubarCheckboxItem>
						<MenubarSeparator />
						<MenubarItem inset disabled>
							Show Status Bar
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem inset>Hide Sidebar</MenubarItem>
						<MenubarItem disabled inset>
							Enter Full Screen
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>Account</MenubarTrigger>
					<MenubarContent forceMount>
						<MenubarLabel inset>Switch Account</MenubarLabel>
						<MenubarSeparator />
						<MenubarRadioGroup value="benoit">
							<MenubarRadioItem value="andy">Andy</MenubarRadioItem>
							<MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
							<MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
						</MenubarRadioGroup>
						<MenubarSeparator />
						<MenubarItem inset>Manage Famliy...</MenubarItem>
						<MenubarSeparator />
						<MenubarItem inset>Add Account...</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
			<div className="p-8 flex-1">
				<div className="rounded-md bg-white shadow-2xl transition-all dark:bg-slate-900">
					<div className="grid grid-cols-4 xl:grid-cols-5">
						<Nav />
						<div className="col-span-3 border-l border-l-slate-200 dark:border-l-slate-700 xl:col-span-4">
							<div className="h-full px-8 py-6">{children}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
	album: Album;
	aspectRatio?: number;
}

export function AlbumArtwork({
	album,
	aspectRatio = 3 / 4,
	className,
	...props
}: AlbumArtworkProps) {
	return (
		<div className={cn("space-y-3", className)} {...props}>
			<ContextMenu>
				<ContextMenuTrigger>
					<AspectRatio
						ratio={aspectRatio}
						className="overflow-hidden rounded-md"
					>
						<img
							src={album.cover}
							alt={album.name}
							// fill
							className="object-cover transition-all hover:scale-105"
						/>
					</AspectRatio>
				</ContextMenuTrigger>
				<ContextMenuContent className="w-40">
					<ContextMenuItem>Add to Library</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
						<ContextMenuSubContent className="w-48">
							<ContextMenuItem>
								<PlusCircle className="mr-2 h-4 w-4" />
								New Playlist
							</ContextMenuItem>
							<ContextMenuSeparator />
							{playlists.map((playlist) => (
								<ContextMenuItem key={playlist}>
									<ListMusic className="mr-2 h-4 w-4" /> {playlist}
								</ContextMenuItem>
							))}
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSeparator />
					<ContextMenuItem>Play Next</ContextMenuItem>
					<ContextMenuItem>Play Later</ContextMenuItem>
					<ContextMenuItem>Create Station</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem>Like</ContextMenuItem>
					<ContextMenuItem>Share</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<div className="space-y-1 text-sm">
				<h3 className="font-medium leading-none">{album.name}</h3>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					{album.artist}
				</p>
			</div>
		</div>
	);
}

interface DemoIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function DemoIndicator({ className }: DemoIndicatorProps) {
	return (
		<span
			className={cn(
				"absolute top-1 right-0 flex h-5 w-5 animate-bounce items-center justify-center",
				className,
			)}
		>
			<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
			<span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
		</span>
	);
}
