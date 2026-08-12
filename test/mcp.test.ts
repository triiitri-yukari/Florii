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
    assert.ok(names.includes("florii_transplant"));
    assert.ok(!names.includes("florii_set_pace"));

    const plantTool = listing.tools.find((tool) => tool.name === "florii_plant");
    assert.match(plantTool?.description ?? "", /intentionally real-time based/);

    const prompt = await client.getPrompt({ name: "spend-a-moment-in-florii", arguments: {} });
    const promptText = JSON.stringify(prompt.messages);
    assert.match(promptText, /Choose the actions/);
    assert.doesNotMatch(promptText, /at most one/i);

    const guide = await client.readResource({ uri: "florii://guide" });
    assert.doesNotMatch(JSON.stringify(guide.contents), /first chapter|90 garden days|final ending/i);

    const species = await client.callTool({ name: "florii_list_species", arguments: {} });
    assert.equal(species.isError, undefined);
    const speciesPayload = species.structuredContent as { species: Array<{ id: string }> };
    assert.equal(speciesPayload.species.length, 12);
    assert.ok(speciesPayload.species.some((item) => item.id === "cloudpoppy"));
    const planted = await client.callTool({ name: "florii_plant", arguments: { species: "cloudpoppy", nickname: "Mori" } });
    assert.equal(planted.isError, undefined);
    const plantedPayload = planted.structuredContent as { planted: { id: string } };
    const visit = await client.callTool({ name: "florii_visit", arguments: { detail: "full" } });
    assert.equal(visit.isError, undefined);
    assert.match(JSON.stringify(visit.structuredContent), /Mori/);
    assert.doesNotMatch(JSON.stringify(visit.structuredContent), /firstChapter|The first chapter/);
    const transplanted = await client.callTool({
      name: "florii_transplant",
      arguments: { targetId: plantedPayload.planted.id, note: "A quieter corner." }
    });
    assert.equal(transplanted.isError, undefined);
    const transplantPayload = transplanted.structuredContent as {
      garden: { plants: unknown[]; herbarium: { archivedCount: number; archivedResidents: Array<{ name: string }> } };
    };
    assert.equal(transplantPayload.garden.plants.length, 0);
    assert.equal(transplantPayload.garden.herbarium.archivedCount, 1);
    assert.match(transplantPayload.garden.herbarium.archivedResidents[0]?.name ?? "", /Mori/);
  } finally {
    await client.close();
  }
});
