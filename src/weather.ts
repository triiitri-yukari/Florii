import { seasonFor } from "./engine.js";
import type { GardenState, WeatherDay } from "./types.js";

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1_000;
const REQUEST_TIMEOUT_MS = 6_000;

interface OpenMeteoDaily {
  time?: unknown;
  weather_code?: unknown;
  temperature_2m_max?: unknown;
  temperature_2m_min?: unknown;
  precipitation_sum?: unknown;
}

interface OpenMeteoResponse {
  daily?: OpenMeteoDaily;
}

export interface WeatherSyncResult {
  selected: GardenState["weatherConfig"]["source"];
  active: "simulated" | "open-meteo";
  fetched: boolean;
  message: string;
}

function conditionFromWmo(code: number, rainMm: number): WeatherDay["condition"] {
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloudy";
  if (code >= 45 && code <= 48) return "mist";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return rainMm >= 18 ? "storm" : "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "frost";
  if (code >= 95) return "storm";
  return rainMm > 0.5 ? "rain" : "cloudy";
}

function numericArray(value: unknown): number[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "number") ? value : null;
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null;
}

function parseDaily(data: OpenMeteoResponse, state: GardenState): WeatherDay[] {
  const times = stringArray(data.daily?.time);
  const codes = numericArray(data.daily?.weather_code);
  const maximums = numericArray(data.daily?.temperature_2m_max);
  const minimums = numericArray(data.daily?.temperature_2m_min);
  const precipitation = numericArray(data.daily?.precipitation_sum);
  if (!times || !codes || !maximums || !minimums || !precipitation) {
    throw new Error("Open-Meteo returned an incomplete daily forecast.");
  }
  if (![codes.length, maximums.length, minimums.length, precipitation.length].every((length) => length === times.length)) {
    throw new Error("Open-Meteo returned daily weather arrays of different lengths.");
  }
  return times.map((date, index) => {
    const rainMm = Math.max(0, precipitation[index] ?? 0);
    const temperatureC = ((maximums[index] ?? 0) + (minimums[index] ?? 0)) / 2;
    return {
      date,
      season: seasonFor(new Date(`${date}T12:00:00.000Z`), state.hemisphere),
      condition: conditionFromWmo(codes[index] ?? 0, rainMm),
      temperatureC: Math.round(temperatureC * 10) / 10,
      rainMm: Math.round(rainMm * 10) / 10,
      source: "open-meteo"
    };
  });
}

export function configureWeather(
  state: GardenState,
  config:
    | { source: "simulated" }
    | { source: "open-meteo"; latitude: number; longitude: number; placeName?: string }
): void {
  if (config.source === "simulated") {
    state.weatherConfig = {
      source: "simulated",
      latitude: null,
      longitude: null,
      placeName: null,
      lastSyncAt: null,
      cachedDays: [],
      lastError: null
    };
    return;
  }
  state.weatherConfig = {
    source: "open-meteo",
    latitude: config.latitude,
    longitude: config.longitude,
    placeName: config.placeName?.trim() || `${config.latitude.toFixed(3)}, ${config.longitude.toFixed(3)}`,
    lastSyncAt: null,
    cachedDays: [],
    lastError: null
  };
}

export async function syncExternalWeather(state: GardenState, force = false): Promise<WeatherSyncResult> {
  const config = state.weatherConfig;
  if (config.source === "simulated") {
    return { selected: "simulated", active: "simulated", fetched: false, message: "Florii is using its own seasonal weather." };
  }
  if (state.mode !== "real") {
    return {
      selected: "open-meteo",
      active: "simulated",
      fetched: false,
      message: "Accelerated modes use simulated weather so one real day is not repeated many times."
    };
  }
  if (config.latitude === null || config.longitude === null) {
    config.lastError = "Open-Meteo needs both latitude and longitude.";
    return { selected: "open-meteo", active: "simulated", fetched: false, message: config.lastError };
  }
  const lastSync = config.lastSyncAt ? Date.parse(config.lastSyncAt) : 0;
  if (!force && Date.now() - lastSync < SYNC_INTERVAL_MS && config.cachedDays.length > 0) {
    return { selected: "open-meteo", active: "open-meteo", fetched: false, message: "Using the recent Open-Meteo cache." };
  }

  const parameters = new URLSearchParams({
    latitude: String(config.latitude),
    longitude: String(config.longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    past_days: "92",
    forecast_days: "16",
    timezone: "auto"
  });
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`, {
      headers: { "user-agent": "Florii/1.0 (+https://github.com/triiitri-yukari/Florii)" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (!response.ok) throw new Error(`Open-Meteo responded with HTTP ${response.status}.`);
    const days = parseDaily((await response.json()) as OpenMeteoResponse, state);
    config.cachedDays = days;
    config.lastSyncAt = new Date().toISOString();
    config.lastError = null;
    return { selected: "open-meteo", active: "open-meteo", fetched: true, message: `Weather synced for ${config.placeName}.` };
  } catch (error) {
    config.lastError = error instanceof Error ? error.message : "Open-Meteo could not be reached.";
    return {
      selected: "open-meteo",
      active: config.cachedDays.length > 0 ? "open-meteo" : "simulated",
      fetched: false,
      message: `Live weather was unavailable; Florii continued safely with ${config.cachedDays.length > 0 ? "cached" : "simulated"} weather.`
    };
  }
}
