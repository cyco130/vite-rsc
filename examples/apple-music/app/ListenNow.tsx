import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Podcast } from "lucide-react";
import {
	DemoIndicator,
	listenNowAlbums,
	AlbumArtwork,
	madeForYouAlbums,
} from "./apple-music-demo";
import { UserAvatar } from "@/components/user-avatar";

export function ListenNow() {
	return (
		<Tabs defaultValue="music" className="h-full space-y-6">
			<div className="space-between flex items-center">
				<TabsList>
					<TabsTrigger value="music" className="relative">
						Music <DemoIndicator className="right-2" />
					</TabsTrigger>
					<TabsTrigger value="podcasts">Podcasts</TabsTrigger>
					<TabsTrigger value="live" disabled>
						Live
					</TabsTrigger>
				</TabsList>
				<UserAvatar />
			</div>
			<TabsContent value="music" className="border-none p-0">
				<ScrollArea className="px-4 py-2">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<h2 className="text-2xl font-semibold tracking-tight">
								Listen Now
							</h2>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Top picks for you. Updated daily.
							</p>
						</div>
					</div>
					<Separator className="my-4" />
					<div className="relative">
						<DemoIndicator className="right-auto left-24 top-32 z-30" />
						<div className="relative flex space-x-4">
							{listenNowAlbums.map((album) => (
								<AlbumArtwork
									key={album.name}
									album={album}
									className="w-[250px]"
								/>
							))}
						</div>
					</div>
					<div className="mt-6 space-y-1">
						<h2 className="text-2xl font-semibold tracking-tight">
							Made for You
						</h2>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Your personal playlists. Updated daily.
						</p>
					</div>
					<Separator className="my-4" />
					<div className="relative">
						<DemoIndicator className="top-32 right-auto left-16 z-30" />
						<ScrollArea>
							<div className="flex space-x-4 pb-4">
								{madeForYouAlbums.map((album) => (
									<AlbumArtwork
										key={album.name}
										album={album}
										className="w-[150px]"
										aspectRatio={1 / 1}
									/>
								))}
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</div>
				</ScrollArea>
			</TabsContent>
			<TabsContent
				value="podcasts"
				className="h-full flex-col border-none p-0 data-[state=active]:flex"
			>
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h2 className="text-2xl font-semibold tracking-tight">
							New Episodes
						</h2>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Your favorite podcasts. Updated daily.
						</p>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-700">
					<div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
						<Podcast className="h-10 w-10 text-slate-400" />
						<h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
							No episodes added
						</h3>
						<p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
							You have not added any podcasts. Add one below.
						</p>
						<Dialog>
							<DialogTrigger>
								<Button size="sm" className="relative">
									<Plus className="mr-2 h-4 w-4" />
									Add Podcast
									<DemoIndicator className="-top-1 -right-1 z-30" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add Podcast</DialogTitle>
									<DialogDescription>
										Copy and paste the podcast feed URL to import.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="url">Podcast URL</Label>
										<Input
											id="url"
											placeholder="https://example.com/feed.xml"
										/>
									</div>
								</div>
								<DialogFooter>
									<Button>Import Podcast</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
}
