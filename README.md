# AIR × WebMCP Challenge Edition

**A shared architectural design canvas for humans and agents.**

AIR is an architectural AI workspace. For the WebMCP Challenge, AIR was extended so an AI agent can participate in the same live design canvas as the architect instead of imitating browser clicks.

> The agent doesn't imitate AIR's UI. It uses AIR's capabilities.

## What the challenge work adds

The production AIR 4.0 application existed before the challenge. The challenge-period work focuses on the WebMCP extension created after August 25, 2026:

- read the live architectural canvas as structured context;
- place visible Draw annotations before generation;
- let the architect draw back on the same canvas;
- expose the combined human + agent sketch structurally;
- propose a visible AREA without generating;
- execute only after the visible design intent is confirmed;
- reuse AIR product state and native workflows rather than browser-coordinate automation.

The design loop is:

**Understand → Mark up → Discuss → Agree → Execute**

## Live AIR demo

Challenge demo URL:

`https://img.airtect.kr/editor?demo=1`

The live product uses the full private AIR 4.0 application and requires an AIR account. Submission testing credentials can be supplied separately. `?demo=1` only adds short event-driven recording captions; it does not add extra WebMCP capabilities.

## Runnable public-safe reference

This repository also contains a small, independently runnable Challenge Edition that demonstrates the shared-canvas WebMCP pattern without publishing AIR's commercial provider integrations, credentials, persistence layer, or unrelated product code.

```bash
npm install
npm run dev
```

Then open the local URL in a browser/environment with WebMCP support. The canvas also remains manually usable when WebMCP is not detected.

For a production build:

```bash
npm run check
npm run preview
```

### Registered WebMCP capabilities

| Tool | Purpose |
| --- | --- |
| `air_get_canvas_context` | Reads normalized Draw, AREA, approval and recent execution state. |
| `air_apply_canvas_markup` | Lets the agent show Draw or AREA markup. It explicitly does **not** generate. |
| `air_execute_design_request` | Demonstrates the agreed execution boundary after visible AREA confirmation. |

The public reference app uses normalized image coordinates (`0..1`) so geometry is independent of browser size. Human Draw strokes and agent Draw strokes are stored in the same state and returned together as structured context.

The final execution in this public reference intentionally applies a visible material tint instead of calling AIR's private commercial image-provider stack. The production AIR demo uses AIR's real native generation workflow.

## Core interaction

```text
Architect intent
      ↓
 ChatGPT / Agent
      ↓  WebMCP registerTool
AIR shared canvas
  ↕           ↕
Draw         AREA
  ↕           ↕
Human edits / confirms
      ↓
Native AIR execution
```

The important boundary is that **markup is communication, not generation**. An agent can point, sketch and discuss before any image-generation action is taken.

## Source map

```text
src/
├─ main.ts       # runnable shared architectural canvas + human Draw/AREA input
├─ store.ts      # shared structured state
├─ types.ts      # public data contracts
├─ webmcp.ts     # direct registerTool capability adapter
└─ styles.css    # reference UI

scripts/
└─ verify.mjs    # verifies the public capability boundary

docs/
├─ ARCHITECTURE.md
├─ CHALLENGE_SCOPE.md
├─ DEMO.md
└─ IMPLEMENTATION_MAP.md
```

## Repository scope

The commercial AIR 4.0 production repository remains separate and private. This repository publishes only the Challenge Edition material under the Apache License 2.0.

It intentionally excludes:

- provider API keys and credentials;
- AIR account data and database integrations;
- proprietary generation/provider routing internals;
- unrelated commercial AIR 4.0 product code.

See [`docs/CHALLENGE_SCOPE.md`](docs/CHALLENGE_SCOPE.md) for the pre-existing vs. challenge-period boundary and [`docs/IMPLEMENTATION_MAP.md`](docs/IMPLEMENTATION_MAP.md) for how this reference maps to the live product.

## Validation status

The live AIR WebMCP workflow has been tested end-to-end for:

- agent Draw shown without generation;
- no History/credit change before generation;
- user-modified sketch read back by the agent;
- agent AREA shown without generation;
- human approval followed by localized generation only;
- History/model metadata update at generation time;
- credit deduction only when generation executes.

The public reference implementation can be checked with `npm run check`.

## License

The material published in this repository is licensed under the Apache License 2.0. See [`LICENSE`](LICENSE).

AIR 4.0 itself is a separate commercial product and is not relicensed by this repository.
