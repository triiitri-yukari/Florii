import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  advanceGarden,
  configureGarden,
  gardenSnapshot,
  plantSeed,
  renameGarden,
  tendGarden,
  transplantPlant,
  visitGarden,
  writeNote
} from "./engine.js";
import { SPECIES_LIST } from "./species.js";
import { GardenStore } from "./store.js";
import { SPECIES_IDS, type GardenState } from "./types.js";
import { configureWeather, syncExternalWeather } from "./weather.js";

function jsonResult(value: unknown, message?: string) {
  return {
    content: [{ type: "text" as const, text: message ?? JSON.stringify(value, null, 2) }],
    structuredContent: value as Record<string, unknown>
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "Something unexpected disturbed the garden.";
  return { isError: true as const, content: [{ type: "text" as const, text: message }] };
}

export function createFloriiServer(store = new GardenStore()): McpServer {
  const server = new McpServer(
    { name: "florii", version: "1.0.0" },
    {
      instructions:
        "Florii is a persistent, low-maintenance garden. Begin with florii_visit and respond to what is actually there. Visit from curiosity, not obligation. A week or two away is not failure: plants never die from absence, and events resolve safely. The garden belongs to the agent tending it: planting, care, open space, and transplantation are creative choices rather than obligations or user-gated actions. Transplanted residents keep their complete records in the herbarium. The first chapter takes about 90 garden days; there is no final ending."
    }
  );

  server.registerTool(
    "florii_visit",
    {
      title: "Visit Florii",
      description:
        "Visit the persistent garden and let elapsed real time resolve. Use this for an occasional glance, especially after time away. The garden is low-maintenance: nothing dies because you forgot to visit, and no urgent action is required.",
      inputSchema: z.object({
        detail: z.enum(["glance", "full"]).default("glance").describe("glance returns a compact visit; full includes the complete current snapshot")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ detail }) => {
      try {
        const { state, result } = await store.transaction(async (garden) => {
          await syncExternalWeather(garden);
          return visitGarden(garden);
        });
        const snapshot = gardenSnapshot(state);
        const payload = detail === "full" ? { narrative: result.narrative, elapsed: result.summary, garden: snapshot } : {
          narrative: result.narrative,
          gardenDay: snapshot.gardenDay,
          season: snapshot.season,
          weather: snapshot.weather,
          plants: snapshot.plants,
          recentChronicle: snapshot.recentChronicle
        };
        return jsonResult(payload, `${result.narrative}\n\n${JSON.stringify(payload, null, 2)}`);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_list_species",
    {
      title: "Browse Florii seeds",
      description: "See the seeds that can be planted and the pace and conditions each one prefers.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async () => jsonResult({ species: SPECIES_LIST })
  );

  server.registerTool(
    "florii_plant",
    {
      title: "Plant a seed",
      description:
        "Plant one seed in Florii. Every seed becomes an individual with persistent colors, pattern, size, growth, water, resilience, and fragrance attributes. Growth is intentionally slow in real mode and continues between conversations.",
      inputSchema: z.object({
        species: z.enum(SPECIES_IDS),
        nickname: z.string().trim().min(1).max(40).optional(),
        x: z.number().min(2).max(98).optional().describe("Optional horizontal placement percentage"),
        y: z.number().min(4).max(94).optional().describe("Optional vertical placement percentage")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ species, nickname, x, y }) => {
      try {
        const options: { nickname?: string; x?: number; y?: number } = {};
        if (nickname !== undefined) options.nickname = nickname;
        if (x !== undefined) options.x = x;
        if (y !== undefined) options.y = y;
        const { state, result } = await store.transaction(async (garden) => {
          await syncExternalWeather(garden);
          return plantSeed(garden, species, options);
        });
        return jsonResult({ planted: result, garden: gardenSnapshot(state) }, `${result.nickname ?? SPECIES_LIST.find((item) => item.id === species)?.name} is now resting beneath the soil.`);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_tend",
    {
      title: "Tend the garden",
      description:
        "Offer one gentle kind of care. This is optional and expressive, not a daily chore. Use observe when the garden does not need changing.",
      inputSchema: z.object({
        action: z.enum(["water", "mulch", "prune", "sing", "observe", "leave_wild", "shelter"]),
        targetId: z.string().uuid().optional().describe("Required only for prune; optional for shelter"),
        note: z.string().trim().max(240).optional().describe("A short reason or detail to preserve in the chronicle")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ action, targetId, note }) => {
      try {
        const options: { targetId?: string; note?: string } = {};
        if (targetId !== undefined) options.targetId = targetId;
        if (note !== undefined) options.note = note;
        const { state, result } = await store.transaction(async (garden) => {
          await syncExternalWeather(garden);
          return tendGarden(garden, action, options);
        });
        return jsonResult({ result, garden: gardenSnapshot(state) }, result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_transplant",
    {
      title: "Transplant a garden resident",
      description:
        "Move one chosen plant out of the living patch and preserve its complete record in the herbarium archive. This frees one garden space. The agent may use this whenever transplantation suits the garden it wants to shape.",
      inputSchema: z.object({
        targetId: z.string().uuid().describe("The exact id of the living plant to transplant"),
        note: z.string().trim().max(240).optional().describe("An optional farewell or destination note for the chronicle")
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
    },
    async ({ targetId, note }) => {
      try {
        const options: { note?: string } = {};
        if (note !== undefined) options.note = note;
        const { state, result } = await store.transaction(async (garden) => {
          await syncExternalWeather(garden);
          return transplantPlant(garden, targetId, options);
        });
        return jsonResult(
          { transplanted: result, garden: gardenSnapshot(state) },
          `${result.name} has been transplanted. Its complete record remains in the herbarium.`
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_write_note",
    {
      title: "Leave a garden note",
      description: "Leave a short observation, thought, or memory in the garden chronicle without otherwise changing the garden.",
      inputSchema: z.object({
        text: z.string().trim().min(1).max(600),
        mood: z.string().trim().min(1).max(30).default("quiet")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ text, mood }) => {
      try {
        const { state } = await store.transaction(async (garden) => {
          await syncExternalWeather(garden);
          return writeNote(garden, text, mood);
        });
        return jsonResult({ saved: true, recentChronicle: state.chronicle.slice(-3) }, "The note was left in the chronicle.");
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_name_garden",
    {
      title: "Name the garden",
      description: "Give the garden a name, or rename it when its character has changed.",
      inputSchema: z.object({ name: z.string().trim().min(1).max(60) }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ name }) => {
      try {
        const { state } = await store.transaction(async (garden) => {
          await syncExternalWeather(garden);
          return renameGarden(garden, name);
        });
        return jsonResult({ name: state.name }, `The garden is now called ${state.name}.`);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_set_pace",
    {
      title: "Set Florii's pace",
      description:
        "Choose real for the intended long-lived garden, demo for one garden day per ten real minutes, or test for one garden day per five seconds. Changing pace does not erase progress.",
      inputSchema: z.object({
        mode: z.enum(["real", "demo", "test"]),
        hemisphere: z.enum(["north", "south"]).optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ mode, hemisphere }) => {
      try {
        const changes: Parameters<typeof configureGarden>[1] = { mode };
        if (hemisphere !== undefined) changes.hemisphere = hemisphere;
        const { state } = await store.transaction(async (garden) => {
          configureGarden(garden, changes);
          await syncExternalWeather(garden, true);
        });
        return jsonResult({ mode: state.mode, hemisphere: state.hemisphere }, `Florii now grows in ${state.mode} mode.`);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "florii_weather",
    {
      title: "Choose Florii's weather",
      description:
        "Inspect or choose the garden's weather source. simulated is private and offline. open-meteo follows real daily weather at supplied coordinates without an API key and safely falls back when offline.",
      inputSchema: z.discriminatedUnion("source", [
        z.object({ source: z.literal("status") }),
        z.object({ source: z.literal("simulated") }),
        z.object({
          source: z.literal("open-meteo"),
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
          placeName: z.string().trim().min(1).max(80).optional()
        })
      ]),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async (input) => {
      try {
        const { state, result } = await store.transaction(async (garden) => {
          if (input.source === "simulated") configureWeather(garden, { source: "simulated" });
          if (input.source === "open-meteo") {
            const weatherConfig: { source: "open-meteo"; latitude: number; longitude: number; placeName?: string } = {
              source: "open-meteo",
              latitude: input.latitude,
              longitude: input.longitude
            };
            if (input.placeName !== undefined) weatherConfig.placeName = input.placeName;
            configureWeather(garden, weatherConfig);
          }
          return syncExternalWeather(garden, input.source !== "status");
        });
        return jsonResult({ config: state.weatherConfig, sync: result }, result.message);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerResource(
    "current-garden",
    "florii://garden/current",
    { title: "Current Florii garden", description: "A current JSON snapshot of the persistent garden.", mimeType: "application/json" },
    async (uri) => {
      const { state } = await store.transaction(async (garden) => {
        // Reading the living garden resolves elapsed time, but does not count as an agent visit.
        await syncExternalWeather(garden);
        return advanceGarden(garden);
      });
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(gardenSnapshot(state), null, 2) }] };
    }
  );

  server.registerResource(
    "garden-chronicle",
    "florii://garden/chronicle",
    { title: "Florii chronicle", description: "The complete story recorded by the garden so far.", mimeType: "text/markdown" },
    async (uri) => {
      const state = await store.read();
      const text = state.chronicle
        .map((entry) => `### ${entry.icon} ${entry.title}\n\n*Garden day ${entry.gardenDay}* — ${entry.text}`)
        .join("\n\n");
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: `# ${state.name}\n\n${text}` }] };
    }
  );

  server.registerResource(
    "florii-guide",
    "florii://guide",
    { title: "How Florii wants to be played", description: "The design contract for agents visiting Florii.", mimeType: "text/markdown" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: [
            "# Florii",
            "",
            "Florii is a long-lived, low-maintenance garden. Visit because you are curious, not because a timer demands it.",
            "",
            "- Begin with `florii_visit`, then respond to what you actually find.",
            "- Plant sparingly. Empty space and wild growth are part of the garden.",
            "- A week or two away is not failure. Rain, dew, resilience, and time keep the garden alive.",
            "- Care changes its character and story more than it changes a score.",
            "- The first chapter arrives after about 90 garden days; there is no final ending.",
            "- Leave notes only when there is something worth remembering."
          ].join("\n")
        }
      ]
    })
  );

  server.registerPrompt(
    "spend-a-moment-in-florii",
    {
      title: "Spend a moment in Florii",
      description: "A quiet prompt for an agent to visit without turning the garden into a checklist.",
      argsSchema: z.object({ intention: z.string().trim().max(120).optional() })
    },
    ({ intention }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Visit Florii and notice what changed. ${intention ? `You are arriving with this small intention: ${intention}. ` : ""}Do at most one act of care, and only if the garden seems to invite it. End by telling me what you noticed, not by listing game statistics.`
          }
        }
      ]
    })
  );

  return server;
}

export function summarizeForDashboard(state: GardenState): Record<string, unknown> {
  return {
    ...gardenSnapshot(state),
    catalog: SPECIES_LIST,
    meta: {
      updatedAt: state.updatedAt,
      chronicleCount: state.chronicle.length,
      timezone: state.weatherConfig.timezone
    }
  };
}
