# Implementation map

This repository is a public reference for the WebMCP interaction pattern used in the live AIR integration. It is not a source dump of the commercial AIR 4.0 product.

| Challenge Edition | Live AIR role |
| --- | --- |
| `src/webmcp.ts` | WebMCP capability adapter registered around current AIR state and actions |
| `air_get_canvas_context` | Reads current canvas/tool/sketch/AREA state structurally |
| `air_apply_canvas_markup` | Shows agent-authored Draw or AREA proposals without generation |
| shared `store.ts` state | Production AIR editor state + normalized sketch lineage |
| human pointer Draw/AREA in `main.ts` | Production AIR native Draw / AREA interaction |
| approval boundary | Human confirmation before execution |
| reference material treatment | Production AIR localized image-generation workflow |

## What is intentionally simplified

The reference implementation uses a small in-memory state store and an abstract architectural canvas. Its final execution applies a visible material treatment. This keeps the public repository independently runnable while excluding AIR's private authentication, database, billing, provider credentials, and commercial generation stack.

The important Challenge behavior is preserved:

1. the agent reads semantic product state rather than screen coordinates;
2. the agent can communicate through visible Draw/AREA markup without generating;
3. the human can change the same canvas;
4. those changes are available back to the agent as structured normalized data;
5. execution remains separate from markup and follows confirmation.

## No browser-click fallback

The WebMCP adapter does not call `.click()`, synthesize `MouseEvent`/`PointerEvent`, or navigate UI controls by coordinates. Human pointer input exists only in the reference canvas UI for the human participant. Agent actions enter through `registerTool` capabilities.

## Data boundary

The public reference contains no production user data, saved AIR project data, test-account credentials, API keys, provider secrets, or database connection strings.
