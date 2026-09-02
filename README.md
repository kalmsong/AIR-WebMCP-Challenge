# AIR × WebMCP Challenge Edition

**An agent-native architectural design workspace where humans and AI can work on the same live design canvas.**

AIR is an architectural AI workspace. For the WebMCP Challenge, AIR was extended so an AI agent can use the application's real design capabilities and state instead of imitating browser clicks.

> The agent doesn't imitate AIR's UI. It uses AIR's capabilities.

## What the Challenge work adds

AIR 4.0 existed before the Challenge. The work developed after August 25, 2026 focuses on the new WebMCP capability layer:

- read the current architectural canvas as structured context;
- load and work with design state without human-style UI navigation;
- place visible Draw and AREA markup without generating an image;
- let the architect modify the same shared canvas;
- expose human + agent markup back to the agent as structured context;
- keep communication and generation as separate actions;
- execute an agreed design change only after human confirmation;
- expose higher-level AIR workspace capabilities through semantic actions rather than coordinate automation.

The core interaction is:

**Understand → Mark up → Discuss → Agree → Execute**

## Live integration

The complete WebMCP integration runs inside the private AIR 4.0 product:

`https://img.airtect.kr/editor`

The live application uses AIR's production editor, state, image-generation workflow, authentication, persistence, and product services. Those proprietary systems are intentionally not duplicated in this repository.

## Runnable open-source reference

This repository contains an independently runnable reference implementation of the shared-canvas WebMCP pattern. It preserves the interaction contract while excluding AIR's commercial provider integrations, credentials, database layer, billing logic, and unrelated product code.

```bash
npm install
npm run dev
```

Then open the local URL in a browser or environment with WebMCP support. The canvas remains manually usable when WebMCP is not detected.

For a production check:

```bash
npm run check
npm run preview
```

### Registered WebMCP capabilities

| Tool | Purpose |
| --- | --- |
| `air_get_canvas_context` | Reads normalized Draw, AREA, approval, and recent execution state. |
| `air_apply_canvas_markup` | Places agent-authored Draw or AREA markup without generation. |
| `air_execute_design_request` | Demonstrates the explicit execution boundary after human confirmation. |

The reference app uses normalized image coordinates (`0..1`) so shared geometry is independent of browser size. Human and agent markup live in the same structured state and can be read back through WebMCP.

The final execution in this reference intentionally applies a visible material treatment instead of calling AIR's private commercial image-provider stack. The live AIR integration uses AIR's native generation workflow.

## Architecture

```text
Architect intent
      ↓
 ChatGPT / Agent
      ↓  WebMCP registerTool
AIR capability layer
      ↓
Shared design canvas
  ↕           ↕
Draw         AREA
  ↕           ↕
Human edits / confirms
      ↓
AIR execution boundary
```

The important product boundary is that **markup is communication, not generation**. An agent can point, sketch, inspect, and discuss before any image-generation action is taken.

## Source map

```text
src/
├─ main.ts       # shared architectural canvas + human Draw/AREA input
├─ store.ts      # shared structured state
├─ types.ts      # public data contracts
├─ webmcp.ts     # direct registerTool capability adapter
└─ styles.css    # reference UI

scripts/
└─ verify.mjs    # verifies the public capability boundary

docs/
├─ ARCHITECTURE.md
├─ CHALLENGE_SCOPE.md
└─ IMPLEMENTATION_MAP.md
```

## Production vs. public repository

The commercial AIR 4.0 repository remains separate and private. This repository publishes only the Challenge Edition material under the Apache License 2.0.

It intentionally excludes:

- provider API keys and credentials;
- AIR account or judge/test-account data;
- database and billing configuration;
- proprietary generation/provider routing internals;
- unrelated commercial AIR 4.0 product code.

See [`docs/CHALLENGE_SCOPE.md`](docs/CHALLENGE_SCOPE.md) for the pre-existing vs. Challenge-period boundary and [`docs/IMPLEMENTATION_MAP.md`](docs/IMPLEMENTATION_MAP.md) for how this reference maps to the live product.

## Validation

The shared-canvas workflow was validated end-to-end for the following boundaries:

- agent markup is visible without triggering generation;
- human modifications can be read back as structured context;
- AREA can remain a communication surface before execution;
- explicit confirmation separates design dialogue from execution;
- agent actions use registered capabilities rather than browser-coordinate clicks.

Run the public reference verification with:

```bash
npm run check
```

## Security

No production credentials, API keys, account data, or test-account credentials belong in this repository. See [`SECURITY.md`](SECURITY.md).

## License

The material published in this repository is licensed under the Apache License 2.0. See [`LICENSE`](LICENSE).

AIR 4.0 itself is a separate commercial product and is not relicensed by this repository.
