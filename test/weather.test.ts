import assert from "node:assert/strict";
import test from "node:test";
import { createGarden } from "../src/engine.js";
import { configureWeather, syncExternalWeather } from "../src/weather.js";

const responseBody = {
  daily: {
    time: ["2026-08-11", "2026-08-12"],
    weather_code: [2, 61],
    temperature_2m_max: [31, 30],
    temperature_2m_min: [26, 25],
    precipitation_sum: [0, 12.5]
  }
};

test("Open-Meteo daily weather is cached in Florii's common weather shape", async (context) => {
  const garden = createGarden(new Date("2026-08-12T00:00:00.000Z"), { mode: "real" });
  configureWeather(garden, { source: "open-meteo", latitude: 1.3521, longitude: 103.8198, placeName: "Singapore" });
  context.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(responseBody), { status: 200 }));
  const result = await syncExternalWeather(garden, true);

  assert.equal(result.active, "open-meteo");
  assert.equal(garden.weatherConfig.cachedDays.length, 2);
  assert.equal(garden.weatherConfig.cachedDays[1]?.condition, "rain");
  assert.equal(garden.weatherConfig.cachedDays[1]?.rainMm, 12.5);
  assert.equal(garden.weatherConfig.cachedDays[1]?.source, "open-meteo");
});

test("a weather outage falls back without blocking the garden", async (context) => {
  const garden = createGarden(new Date("2026-08-12T00:00:00.000Z"), { mode: "real" });
  configureWeather(garden, { source: "open-meteo", latitude: 1.3, longitude: 103.8 });
  context.mock.method(globalThis, "fetch", async () => {
    throw new Error("offline");
  });
  const result = await syncExternalWeather(garden, true);

  assert.equal(result.active, "simulated");
  assert.match(result.message, /continued safely/i);
  assert.equal(garden.weatherConfig.source, "open-meteo");
  assert.equal(garden.weatherConfig.lastError, "offline");
});

test("accelerated modes deliberately keep simulated weather", async () => {
  const garden = createGarden(new Date("2026-08-12T00:00:00.000Z"), { mode: "demo" });
  configureWeather(garden, { source: "open-meteo", latitude: 1.3, longitude: 103.8 });
  const result = await syncExternalWeather(garden, true);
  assert.equal(result.active, "simulated");
  assert.match(result.message, /accelerated modes/i);
});
