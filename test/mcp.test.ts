import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

test("the built stdio server completes a real MCP handshake and tool call", async () => {
  const directory = await mkdtemp(join(tmpdir(), "florii-mcp-"));
  const client = new Client({ name: "florii-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve("dist/src/index.js")],
    env: { ...process.env, FLORII_DATA_DIR: directory } as Record<string, string>,
    stderr: "pipe"
  });
  try {
    await client.connect(transport);
    const listing = await client.listTools();
    const names = listing.tools.map((tool) => tool.name);
    assert.ok(names.includes("florii_visit"));
    assert.ok(names.includes("florii_weather"));
    assert.ok(names.includes("florii_plant"));

    const species = await client.callTool({ name: "florii_list_species", arguments: {} });
    assert.equal(species.isError, undefined);
    const planted = await client.callTool({ name: "florii_plant", arguments: { species: "moonbell", nickname: "Mori" } });
    assert.equal(planted.isError, undefined);
    const visit = await client.callTool({ name: "florii_visit", arguments: { detail: "full" } });
    assert.equal(visit.isError, undefined);
    assert.match(JSON.stringify(visit.structuredContent), /Mori/);
  } finally {
    await client.close();
  }
});
