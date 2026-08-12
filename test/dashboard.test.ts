import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

async function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a local port."));
        return;
      }
      const port = address.port;
      server.close((error) => (error ? reject(error) : resolvePort(port)));
    });
  });
}

async function waitFor(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 50));
  }
  throw lastError;
}

test("the compiled dashboard serves its public assets and garden API", async () => {
  const port = await freePort();
  const directory = await mkdtemp(join(tmpdir(), "florii-dashboard-"));
  const child = spawn(process.execPath, [resolve("dist/src/dashboard.js")], {
    env: { ...process.env, FLORII_DATA_DIR: directory, FLORII_PORT: String(port) },
    stdio: "pipe"
  });
  try {
    const page = await waitFor(`http://127.0.0.1:${port}/`);
    assert.match(await page.text(), /A garden for patient machines/);
    const css = await fetch(`http://127.0.0.1:${port}/styles.css`);
    assert.equal(css.status, 200);
    assert.match(css.headers.get("content-type") ?? "", /text\/css/);
    assert.match(await css.text(), /data-shape="lace"/);
    const script = await fetch(`http://127.0.0.1:${port}/app.js`);
    assert.equal(script.status, 200);
    const scriptText = await script.text();
    assert.match(scriptText, /cloudpoppy/);
    assert.match(scriptText, /style\.petals/);
    const api = await fetch(`http://127.0.0.1:${port}/api/garden`);
    const payload = (await api.json()) as { name: string; plants: unknown[]; state: { schemaVersion: number } };
    assert.equal(payload.name, "A Quiet Patch");
    assert.equal(payload.state.schemaVersion, 1);
  } finally {
    child.kill("SIGTERM");
    await new Promise<void>((resolveExit) => child.once("exit", () => resolveExit()));
  }
});
