"use server";

import { getSession } from "rsc-auth";
import { request } from "stream-react/request";
import { authOptions } from "./auth";

export async function sayHello() {
	let user = await getSession(request(), authOptions);
	if (!user) {
		throw new Error("You must be logged in to increment the counter.");
	}

	return "Hello";
}
