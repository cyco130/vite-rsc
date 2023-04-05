import { Auth, AuthConfig } from "@auth/core";
import { AuthAction } from "@auth/core/types";

const actions: AuthAction[] = [
	"providers",
	"session",
	"csrf",
	"signin",
	"signout",
	"callback",
	"verify-request",
	"error",
];

export function AuthHandler(prefix: string, authOptions: AuthConfig) {
	authOptions.secret ??= process.env.AUTH_SECRET;
	authOptions.trustHost ??= !!(
		process.env.AUTH_TRUST_HOST ??
		process.env.VERCEL ??
		process.env.NODE_ENV !== "production"
	);

	return async (request: Request) => {
		const url = new URL(request.url);
		const action = url.pathname
			.slice(prefix.length + 1)
			.split("/")[0] as AuthAction;

		if (!actions.includes(action) || !url.pathname.startsWith(prefix + "/")) {
			return;
		}

		return await Auth(request, authOptions);
	};
}
