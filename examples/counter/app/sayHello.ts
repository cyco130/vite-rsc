"use server";

export default async function serverFn(hello: string, name: string) {
	console.log(name, ":", hello);
	return `Hello ${name}!`;
}
