"use server";

export async function sayHello(hello: string, name: string) {
	console.log(name, ":", hello);
	return `Hello ${name}!`;
}
