import { useCallback, useState } from "react";

export function useRerender() {
	const [_, rerender] = useState(() => 0);
	return useCallback(() => {
		rerender((n) => n + 1);
	}, [rerender]);
}
