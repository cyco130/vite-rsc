import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import type {
	ModuleImports,
	RouteModule as CoreRouteModule,
} from "@impalajs/core";
import type { ElementType } from "react";

export type RouteModule = CoreRouteModule<ElementType>;
export function clientBootstrap(modules: ModuleImports<RouteModule>) {
	const context = (window as any).___CONTEXT;

	if (context && "chunk" in context) {
		const mod = modules[context.chunk];
		if (mod) {
			mod().then(({ default: Page }) => {
				startTransition(() => {
					hydrateRoot(
						document,
						<StrictMode>
							<Page {...context} />
						</StrictMode>,
						{
							onRecoverableError(err) {
								console.error(err);
							},
						},
					);
				});
			});
		} else {
			console.error(
				`[Impala] Could not hydrate page. Module not found: ${context?.chunk}`,
			);
		}
	} else {
		console.log("[Impala] No context found. Skipping hydration.");
	}
}

const modules = import.meta.glob<RouteModule>("./routes/**/*.{tsx,jsx}");

clientBootstrap(modules);
