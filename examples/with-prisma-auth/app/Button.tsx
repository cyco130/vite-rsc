"use client";

import { useRouter } from "stream-react/router";
import { useMutation } from "stream-react/mutation";

export default function Button({ onClick }: { onClick: () => Promise<any> }) {
	const mutate = useMutation();
	const router = useRouter();
	return (
		<div>
			<button
				onClick={() => {
					mutate(() => onClick());
				}}
			>
				Increment
			</button>
			<button
				onClick={() => {
					router.refresh();
				}}
			>
				Refresh
			</button>
		</div>
	);
}
