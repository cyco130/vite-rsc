import { test } from "@playwright/test";
import type { Fixture, FixtureInit } from "./create-server.js";
import { createServer } from "./create-server.js";

export { js } from "./create-server.js";
export function createFixture(t: typeof test, init: FixtureInit) {
	let fixture: Fixture;
	test.beforeAll(async () => {
		fixture = await createServer({
			files: {},
		});

		// appFixture = await fixture.createServer();
	});

	test.afterAll(async () => {
		// await appFixture.close();
	});

	let logs: string[] = [];

	test.beforeEach(({ page }) => {
		page.on("console", (msg) => {
			logs.push(msg.text());
		});
	});

	return new Proxy(
		{},
		{
			get(target, prop) {
				return fixture[prop];
			},
		},
	) as Fixture;
}
