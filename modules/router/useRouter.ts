import { useEffect, useState } from "react";

export function useRouter() {
	let router = (globalThis as typeof window).router;
	const [state, setState] = useState(router.location);
	useEffect(() => {
		let listener = () => setState(router.location);
		router.addEventListener("locationchange", listener);
		return () => router.removeEventListener("locationchange", listener);
	}, []);
	return (globalThis as typeof window).router;
}
