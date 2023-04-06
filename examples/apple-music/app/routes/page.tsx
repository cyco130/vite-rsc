import { PageConfig } from "./page.types";

export { ListenNow as default } from "../ListenNow";

export const config = {
	validateSearch: (search) => {
		return {
			page: Number(search?.page ?? 1),
		};
	},
} satisfies PageConfig;
