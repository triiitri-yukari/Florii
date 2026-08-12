#!/usr/bin/env node
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { advanceGarden } from "./engine.js";
import { summarizeForDashboard } from "./server.js";
import { GardenStore } from "./store.js";
import { syncExternalWeather } from "./weather.js";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const developmentPublicDirectory = resolve(moduleDirectory, "../public");
const compiledPublicDirectory = resolve(moduleDirectory, "../../public");
const publicDirectory = existsSync(developmentPublicDirectory) ? developmentPublicDirectory : compiledPublicDirectory;
const store = new GardenStore();
const port = Number.parseInt(process.env.FLORII_PORT ?? "4141", 10);
const host = process.env.FLORII_HOST ?? "127.0.0.1";

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (request.method === "GET" && url.pathname === "/api/garden") {
    try {
      const { state } = await store.transaction(async (garden) => {
        await syncExternalWeather(garden);
        return advanceGarden(garden);
      });
      response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      response.end(JSON.stringify(summarizeForDashboard(state)));
    } catch (error) {
      response.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to read Florii." }));
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" });
    response.end();
    return;
  }
  const relative = url.pathname === "/" ? "index.html" : normalize(url.pathname).replace(/^[/\\]+/, "");
  const filePath = join(publicDirectory, relative);
  if (!filePath.startsWith(publicDirectory)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "content-length": info.size,
      "x-content-type-options": "nosniff"
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Florii could not find that path.");
  }
});

server.listen(port, host, () => {
  console.log(`Florii is growing at http://${host}:${port}`);
});
