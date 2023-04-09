import { expect, test } from "@playwright/test";
import { createFixture, js, selectHtml, prettyHtml } from "./helpers/index.js";

test.describe("rendering", () => {
	let fixture = createFixture(test, {
		files: {},
	});

	test("server renders matching routes", async () => {
		let res = await fixture.requestDocument("/");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(selectHtml(await res.text(), "#root")).toBe(
			prettyHtml(`<div id="root">Hello World</div>`),
		);
	});
});
