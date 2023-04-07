"use server";

import { getSession } from "rsc-auth";
import { request } from "flight-router/server";
import { authOptions } from "./auth";
import db from "./db";

export async function increment() {
	let user = await getSession(request(), authOptions);
	if (!user) {
		throw new Error("You must be logged in to increment the counter.");
	}
	let count = await getCount();
	await db.counter.update({
		where: { id: 1 },
		data: { value: count + 1 },
	});
	return count + 1;
}

export async function getCount() {
	return (
		(
			await db.counter.findFirst({
				where: { id: 1 },
				select: { value: true },
			})
		)?.value ?? 0
	);
}
