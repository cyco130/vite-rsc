import { PrismaClient } from "@prisma/client";

declare global {
	var db: PrismaClient;
}

globalThis.db = globalThis.db || new PrismaClient();

export default globalThis.db;
