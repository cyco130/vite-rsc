import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import { faker } from "@faker-js/faker";

export type Contact = {
	id: string;
	first: string;
	last: string;
	avatar: string;
	createdAt: Date;
	notes: string;
	favorite?: boolean;
	twitter: string;
};

const createRandomContact = (): Contact => ({
	id: faker.datatype.uuid(),
	first: faker.name.firstName(),
	last: faker.name.lastName(),
	avatar: faker.image.avatar(),
	createdAt: faker.date.past(),
	notes: faker.lorem.sentence(),
	twitter: faker.internet.userName(),
});

const contactsStore = Array.from({ length: 10 }).map(() =>
	createRandomContact(),
);

export async function getContacts(query?: string) {
	await fakeNetwork(`getContacts:${query}`);
	let contacts = contactsStore;
	if (query) {
		contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
	}
	return contacts.sort(sortBy("last", "createdAt"));
}

export async function createContact() {
	await fakeNetwork();
	let id = Math.random().toString(36).substring(2, 9);
	let contact = { id, createdAt: Date.now() };
	let contacts = await getContacts();
	contacts.unshift(contact);
	await set(contacts);
	return contact;
}

export async function getContact(id: string) {
	await fakeNetwork(`contact:${id}`);
	let contact = contactsStore.find((contact) => contact.id === id);
	return contact ?? null;
}

// export async function updateContact(id, updates) {
// 	await fakeNetwork();
// 	let contacts = await localforage.getItem("contacts");
// 	let contact = contacts.find((contact) => contact.id === id);
// 	if (!contact) throw new Error("No contact found for", id);
// 	Object.assign(contact, updates);
// 	await set(contacts);
// 	return contact;
// }

// export async function deleteContact(id) {
// 	let contacts = await localforage.getItem("contacts");
// 	let index = contacts.findIndex((contact) => contact.id === id);
// 	if (index > -1) {
// 		contacts.splice(index, 1);
// 		await set(contacts);
// 		return true;
// 	}
// 	return false;
// }

async function fakeNetwork(key?: string) {
	return new Promise((res) => {
		setTimeout(res, Math.random() * 800);
	});
}
