import { authOptions } from "@/lib/auth";
import { handleAuthRequest } from "rsc-auth";

export async function GET(request: Request) {
	return await handleAuthRequest(request, "/api/auth", authOptions);
}

export async function POST(request: Request) {
	return await handleAuthRequest(request, "/api/auth", authOptions);
}
