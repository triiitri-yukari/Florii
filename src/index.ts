#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createFloriiServer } from "./server.js";

const handle = serveStdio(() => createFloriiServer(), {
  onerror: (error) => console.error(`[florii] ${error.message}`)
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void handle.close().finally(() => process.exit(0));
  });
}
