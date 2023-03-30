import Counter from "./Counter";
import fs from "node:fs";

export async function App() {
	// Look, async code!
	const packageJson = await fs.promises.readFile("package.json", "utf8");

	return (
		<div>
			<h1>Hello, world!</h1>

			<Counter initialCount={42} />

			<p>Look, I read a file from the filesystem!</p>
			<pre>{packageJson}</pre>
		</div>
	);
}
