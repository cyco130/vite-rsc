import { siteConfig } from "@/config/site";
import { Layout } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { A } from "@vite-rsc/router";
import { AppleMusicDemo } from "./apple-music-demo";
import Hello from "./hello.mdx";

console.log(Hello);

export default function IndexPage() {
	return (
		<Layout>
			<section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
				<div className="flex max-w-[980px] flex-col items-start gap-2">
					<h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
						Beautifully designed components <br className="hidden sm:inline" />
						built with Radix UI and Tailwind CSS.
					</h1>
					<p className="max-w-[700px] text-lg text-slate-700 dark:text-slate-400 sm:text-xl">
						Accessible and customizable components that you can copy and paste
						into your apps. Free. Open Source. And Vite Ready.
					</p>
				</div>
				<div className="flex gap-4">
					<A
						href={siteConfig.links.docs}
						target="_blank"
						rel="noreferrer"
						className={buttonVariants({ size: "lg" })}
					>
						Documentation
					</A>
					<A
						target="_blank"
						rel="noreferrer"
						href={siteConfig.links.github}
						className={buttonVariants({ variant: "outline", size: "lg" })}
					>
						GitHub
					</A>
				</div>
			</section>
		</Layout>
	);
}
