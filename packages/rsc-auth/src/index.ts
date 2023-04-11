import { Auth, AuthConfig } from "@auth/core";
import { AuthAction, Session } from "@auth/core/types";

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

export async function handleAuthRequest(
	request: Request,
	prefix: string,
	authOptions: AuthConfig,
) {
	authOptions.secret ??= process.env.AUTH_SECRET;
	authOptions.trustHost ??= !!(
		process.env.AUTH_TRUST_HOST ??
		process.env.VERCEL ??
		process.env.NODE_ENV !== "production"
	);

	const url = new URL(request.url);
	const action = url.pathname
		.slice(prefix.length + 1)
		.split("/")[0] as AuthAction;

	if (!actions.includes(action) || !url.pathname.startsWith(prefix + "/")) {
		console.log(`No auth action found in ${action}`);
		return;
	}

	return await Auth(request, authOptions);
}

type GetSessionResult = Promise<Session | null>;

export async function getSession(
	req: Request,
	options: AuthConfig,
): GetSessionResult {
	options.secret ??= process.env.AUTH_SECRET;
	options.trustHost ??= true;

	const url = new URL("/api/auth/session", req.url);
	const response = await Auth(
		new Request(url, { headers: req.headers }),
		options,
	);

	const { status = 200 } = response;

	const data = await response.json();

	if (!data || !Object.keys(data).length) return null;
	if (status === 200) return data;
	throw new Error(data.message);
}
