const story = (path: string) => `https://node-hnapi.herokuapp.com/${path}`;
const user = (path: string) =>
	`https://hacker-news.firebaseio.com/v0/${path}.json`;

export default async function fetchAPI<T>(path: string): Promise<T> {
	const url = path.startsWith("user") ? user(path) : story(path);
	const headers: Record<string, string> = { "User-Agent": "chrome" };
	console.log(url);

	try {
		let response = await fetch(url, { headers });
		let text = await response.text();
		try {
			if (text === null) {
				throw { error: "Not found" };
			}
			return JSON.parse(text);
		} catch (e) {
			console.error(`Recevied from API: ${text}`);
			console.error(e);
			throw { error: e };
		}
	} catch (error) {
		throw { error };
	}
}
