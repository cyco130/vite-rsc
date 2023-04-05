"use client";

import { useRouter } from "./useRouter";
import { useCallback, useState } from "react";

export const useMutation = () => {
	const [state, setState] = useState();
	const router = useRouter();

	if (state) {
		throw state;
	}

	return useCallback(async function <T extends (...args: any[]) => void>(
		fn: T,
	) {
		try {
			return await router.mutate(() => {
				return fn();
			});
		} catch (error: any) {
			setState(error);
		}
	},
	[]);
};
