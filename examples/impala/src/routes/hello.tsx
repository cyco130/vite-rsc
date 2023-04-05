import { App } from "../App";
import type { StaticRouteProps } from "@impalajs/core";

export default function Hello({
  path,
  routeData,
}: StaticRouteProps<typeof import("./hello.data")>) {
  return (
    <App title="Hello">
      <div>
        <>
          {routeData?.msg} {path}!
        </>
      </div>
    </App>
  );
}
