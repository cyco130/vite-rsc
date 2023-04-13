import { Connection, connect } from "@planetscale/database";

console.log(process.env.DATABASE_URL);
declare global {
	var db: Connection;
}

globalThis.db =
	globalThis.db ||
	connect({
		url: import.meta.env.VITE_DATABASE_URL,
	});

export default globalThis.db;
