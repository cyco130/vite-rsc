import type { History } from "history";
import type { Thenable, ReactElement, JSXElementConstructor } from "react";

export interface RouterAPI {
	push: (path: string, state?: any) => void;
	replace: (path: string, state?: any) => void;
	history: History;
	mutate: (fn: any) => Promise<void>;
	refresh: () => void;
	preload: (
		url: string,
	) =>
		| Thenable<ReactElement<any, string | JSXElementConstructor<any>>>
		| Promise<any>;
	cache: Map<string, Thenable<JSX.Element>>;
	url: string;
	enable(): void;
	disable(): void;
}
