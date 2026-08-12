# Florii

> A quiet, persistent garden for AI agents—grown through real time over MCP.

Florii is not a streak, a daily chore, or a tamagotchi waiting to punish absence. An agent can plant a few seeds, disappear into other conversations, and return days or weeks later to find that rain visited, a flower opened, or a wind-carried seed settled beside the path.

The first chapter takes about **90 garden days**. The garden itself has no ending.

## What grows here

- Persistent local state with atomic, cross-process-safe writes
- Slow plant lifecycles, seasonal rest, blooming, and natural reseeding
- Rain, dew, soil moisture, biodiversity, wildlife, and quiet discoveries
- Absence-friendly rules: plants never die because nobody checked in
- A chronicle of notable changes instead of noisy daily logs
- Twelve fictional species with different seasonal, water, resilience, and growth preferences
- Persistent individual variation: flower colors, patterns, size, pace, water needs, resilience, and fragrance
- A permanent herbarium that remembers discovered species, color-pattern variations, and notable individuals
- Second-generation plants inherit their parent's appearance and attributes with gentle mutation
- Simulated weather by default, or optional real weather from Open-Meteo
- MCP tools, resources, a reusable agent prompt, and host-neutral instructions
- A responsive, read-only human garden view at `http://127.0.0.1:4141`, with individual plant profiles, a living collection, a permanent herbarium, and a filterable seed library
- Real and demo time scales using the same simulation rules

## The pace

| Mode | Garden time | Intended use |
| --- | --- | --- |
| `real` | 1 garden day per real day | The actual long-lived garden |
| `demo` | 1 garden day per 10 minutes | Showing a lifecycle without waiting months |

In real mode, seeds usually sprout in several days, first flowers arrive over a few weeks, and the **First Chapter** milestone unlocks after roughly one season. Yearly and generational milestones continue after that.

## Seed catalogue

| Seed | Character | Preferred seasons | Water tendency |
| --- | --- | --- | --- |
| Moonbell | Quiet evening bells | Spring, autumn | Moderate |
| Starpetal | Bright clustered stars | Spring, summer | Moderate-dry |
| Rainmint | Cool rain-beaded leaves | Spring–autumn | Wet |
| Emberbloom | Coral dry-weather blooms | Summer, autumn | Dry |
| Duskfern | Shade-loving dusk fronds | Spring, autumn, winter | Moist |
| Cloverlight | Quick glowing groundcover | Spring–autumn | Moderate |
| Snowlace | Slow frost-bright petals | Winter, spring | Moderate |
| Sunsigh | Warm papery sun blooms | Summer, autumn | Very dry |
| Tideglass | Translucent droplet-edged flowers | Spring, summer | Very wet |
| Velvethorn | Slow velvet-dark blooms | Autumn, winter | Dry |
| Lanternmoss | Tiny dusk-lit cups | Autumn, winter | Wet |
| Cloudpoppy | Soft trembling wide petals | Spring, summer | Moderate |

## Quick start

Florii requires Node.js 22 or newer.

```bash
git clone https://github.com/triiitri-yukari/Florii.git
cd Florii
npm install
npm run build
```

The MCP command is then:

```bash
node /absolute/path/to/Florii/dist/src/index.js
```

Florii creates its save at `~/.florii/garden.json`. Set `FLORII_DATA_DIR` if you want the garden somewhere else. The save file is deliberately ignored by Git.

## Connect it to an MCP client

Florii works with any MCP client that can launch a local STDIO server. Add it using your client's local-server settings; the common configuration shape is:

```json
{
  "mcpServers": {
    "florii": {
      "command": "node",
      "args": ["/absolute/path/to/Florii/dist/src/index.js"],
      "env": {
        "FLORII_DATA_DIR": "/absolute/path/to/my-florii-data"
      }
    }
  }
}
```

Configuration formats and field names vary between clients, but the command, arguments, and environment values are the same. Restart or reload the client after saving the configuration.

Clients that cannot launch local processes will need Florii to be wrapped and hosted as a remote MCP server instead.

## MCP surface

| Tool | Purpose |
| --- | --- |
| `florii_visit` | Resolve elapsed time and take a glance or full visit |
| `florii_list_species` | Browse the twelve available seeds |
| `florii_plant` | Plant a seed, optionally with a nickname and position |
| `florii_tend` | Water, mulch, prune, sing, observe, shelter, or leave a corner wild |
| `florii_transplant` | Move one explicitly chosen resident out of the living patch while preserving its complete herbarium record |
| `florii_write_note` | Preserve a thought in the garden chronicle |
| `florii_name_garden` | Name or rename the garden |
| `florii_set_pace` | Switch the garden's time scale |
| `florii_weather` | Inspect or choose simulated/Open-Meteo weather |

Florii also exposes:

- `florii://garden/current` — current structured snapshot
- `florii://garden/chronicle` — full Markdown chronicle
- `florii://guide` — the low-maintenance play contract
- `spend-a-moment-in-florii` — a prompt that invites one quiet visit, not a checklist

## Individual plants

Species defines the broad lifecycle, but it does not fully determine a plant. Every planted or wind-carried seed receives a permanent phenotype:

- primary, secondary, and center colors
- solid, gradient, tipped, speckled, or bicolor petals
- individual height and bloom size
- functional growth-rate, water-need, and resilience values
- an optional green, honey, rain, citrus, or night-sweet fragrance
- common, unusual, or rare variation

These values are saved with the plant and shown in `florii_visit` results and the local garden view. They are not cosmetic labels: growth rate changes daily growth, water need changes moisture fit and stress, and resilience changes recovery.

When a mature plant self-seeds, its child normally inherits its colors, pattern, fragrance, stature, and growing tendencies, with a small mutation toward the species' natural range. This allows a garden to develop its own little family lines over the years without turning heredity into a breeding spreadsheet.

## Herbarium

Every individual is registered when it enters the garden, whether it was planted deliberately, carried by the wind, or born through natural reseeding. The herbarium permanently keeps:

- species discovery progress
- named color and petal-pattern variations
- the first garden day each species and variation appeared
- unusual and rare individual finds
- the number of individuals seen for each species and variation
- complete portraits and attributes for residents deliberately transplanted out of the living patch

Older saves are backfilled from their living plants the first time they are opened. Herbarium records live in the same `garden.json` save and do not depend on browser storage.

The living patch holds up to 48 plants. The simulation never removes a resident automatically: when full, new planting, wind-carried arrivals, and natural reseeding pause. The agent tending the garden is free to use `florii_transplant` whenever moving one or more residents suits the garden it wants to shape. Each call moves one exact plant so every choice is explicit and saved atomically, but there is no behavioral limit on how many plants the agent may transplant. A transplanted plant stops growing in the active simulation, while its last portrait, phenotype, age, bloom count, origin, generation, transplant day, and optional note remain permanently available in the herbarium.

## Optional real weather

The garden is offline-first. Its default weather is deterministic and seasonal. To let real weather touch it, call `florii_weather`:

```json
{
  "source": "open-meteo",
  "latitude": 1.3521,
  "longitude": 103.8198,
  "placeName": "Singapore"
}
```

Open-Meteo needs no API key. Florii caches daily weather for six hours and requests recent daily temperature, precipitation, and WMO weather codes. If the service or network is unavailable, cached data is used when possible; otherwise the simulation continues with Florii weather. No garden action fails because a weather API failed.

Accelerated modes always use simulated weather so one real-world rainy day is not copied across dozens of accelerated garden days. Switch back at any time:

```json
{ "source": "simulated" }
```

Weather data attribution: [Open-Meteo](https://open-meteo.com/).

## Open the garden view

The dashboard reads the same save file as the MCP server and safely resolves elapsed time without counting it as an agent visit.

```bash
npm run garden
```

Open `http://127.0.0.1:4141`. To use the compiled build, run `npm run start:garden`. Optional environment variables:

```bash
FLORII_PORT=5050 FLORII_HOST=127.0.0.1 npm run garden
```

The viewer binds to loopback by default and provides no write endpoints.

## Design rules

Florii is built around a small contract:

1. Absence creates history, not failure.
2. Care changes character more than score.
3. Empty space and untidy corners are valid garden states.
4. Events linger or resolve naturally; none demand instant action.
5. The agent should visit from curiosity, not optimize a maintenance loop.
6. Milestones mark chapters without turning the garden into something to finish.

The health floor is intentional. Harsh weather or mismatched care can slow growth and change when a plant blooms, but cannot permanently delete a plant. Florii keeps the consequences expressive and recoverable.

## Architecture

```mermaid
flowchart TD
    Host["MCP host"] --> Server["Florii MCP server"]
    Server --> Store["Atomic garden save"]
    Store --> Engine["Time + ecology engine"]
    Weather["Simulated or Open-Meteo"] --> Engine
    Viewer["Local garden view"] --> Store
    Engine --> Chronicle["Garden chronicle"]
```

- `src/engine.ts` owns deterministic time, weather selection, growth, ecology, events, and milestones.
- `src/store.ts` owns atomic JSON persistence and a stale-safe file lock.
- `src/weather.ts` adapts optional Open-Meteo data into the common daily weather shape.
- `src/server.ts` exposes the MCP tools, resources, prompt, and agent instructions.
- `src/dashboard.ts` serves the loopback-only viewer and read-only JSON endpoint.
- `public/` contains the dependency-free visual garden.

## Development

Contributor notes and local development commands live in [docs/development.md](docs/development.md).

## Data and recovery

`garden.json` is ordinary readable JSON. Writes go to a private temporary file and are atomically renamed under a short-lived lock, preventing the dashboard and MCP server from overwriting each other. To back up a garden, copy its data directory while Florii is not writing. There is intentionally no remote telemetry or account system.

## License

MIT
