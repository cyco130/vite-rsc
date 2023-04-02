export function useRouter() {
	return (globalThis as typeof window).router;
}
