export function component<T extends (...args: any[]) => any>(fn: T) {
	return fn as unknown as React.FC<
		Parameters<T>[0] extends undefined ? {} : Parameters<T>[0]
	>;
}
