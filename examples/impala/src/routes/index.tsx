import type { StaticRouteProps } from "@impalajs/core";
import { App } from "../App";
import logo from "../assets/impala.png";
import "./index.css";
import { Button } from "../components/button";
export default function Hello({
	path,
	assets,
}: StaticRouteProps & { assets?: Array<string> }) {
	return (
		<App title="Home" assets={assets}>
			<div className="App">
				<div>
					<img src={logo} alt="Impala Logo" className="logo" />
				</div>
				<h1>Impala</h1>
				<div className="card">
					<Button />
					<p>
						Edit <code>src/routes/index.tsx</code> and save to test HMR
					</p>
				</div>
			</div>
		</App>
	);
}
