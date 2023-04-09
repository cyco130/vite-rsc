import { RenderToReadableStreamOptions } from "react-dom/server.edge";

export type Env = {
	clientModuleMap: ModuleMap;
	components: { [key: string]: any };
} & RenderToReadableStreamOptions;
