# Architecture

## Principle

AIR treats WebMCP as a capability adapter around the existing product rather than as browser automation.

```text
ChatGPT / Agent
      │
      │ WebMCP registerTool
      ▼
AIR capability adapters
      │
      ├─ Canvas state
      ├─ Draw markup
      ├─ AREA selection
      ├─ Native image execution
      ├─ Moodboard / Mix
      ├─ Persistent Context
      ├─ Finish
      └─ Video
      │
      ▼
Existing AIR application state and services
```

The adapter should not create a parallel rendering stack. It synchronizes the same state and execution paths used by the human-facing AIR UI.

## Shared canvas model

The human and agent share two kinds of context:

- **Visual context** — what is visible on the AIR canvas.
- **Structured context** — normalized Draw annotations, AREA state, model/tool state and recent result metadata.

Draw annotations use normalized image coordinates so the same geometry remains meaningful independent of browser size. Agent-authored markup is visible to the architect, while the same annotation data can be read structurally by the agent.

AREA proposals follow the same idea: the agent can mark a target region as a visible design proposal without triggering generation.

## Why this is different from click automation

A browser automation approach would need to:

1. find the Gallery button;
2. open Gallery;
3. locate a thumbnail;
4. click it;
5. find Draw/AREA controls;
6. translate semantic intent into screen coordinates;
7. click Render.

AIR's WebMCP layer instead exposes high-level product actions such as loading the latest design, reading the canvas, applying markup and executing a design request. The model operates on product semantics rather than fragile DOM coordinates.

## Demo captions

`?demo=1` is intentionally presentation-only. It listens to real product events and briefly displays explanatory captions during recording. It does not register extra WebMCP tools and it does not change the normal product workflow.
