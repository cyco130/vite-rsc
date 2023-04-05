import type { StaticRouteProps } from "@impalajs/core";
import { App } from "../App";
import logo from "../assets/impala.png";
import "./index.css";
import Button from "../components/button";
export default function Hello({ path }: StaticRouteProps) {
  return (
    <App title="Home">
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
