import db from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Github, { GitHubProfile } from "@auth/core/providers/github";
import { AuthConfig } from "@auth/core";
import { Profile } from "@auth/core/types";
import { Provider } from "@auth/core/providers";
import { Adapter } from "@auth/core/adapters";

export let authOptions: AuthConfig = {
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		Github({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		}) as Provider<Profile>,
	],
	secret: "secret",
};
