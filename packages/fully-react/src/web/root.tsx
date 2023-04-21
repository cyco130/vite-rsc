import React from "react";
import { ServerComponent } from "./server-component";

export function Root() {
	return <ServerComponent url={location.href} />;
}
