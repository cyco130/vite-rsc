export * from "./createRouter";
export type { PageProps } from "../types";

export function component<T extends (...args: any[]) => any>(fn: T) {
	return fn as unknown as React.FC<Parameters<T>[0]>;
}
