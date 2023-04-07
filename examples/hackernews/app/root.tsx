import "./root.css";
import { createRouter } from "flight-router/server";
import { createFileSystemRoutes } from "flight-router/fs";
import path from "path";
import { fileURLToPath } from "url";

export default createRouter(
	createFileSystemRoutes(path.dirname(fileURLToPath(new URL(import.meta.url)))),
);
