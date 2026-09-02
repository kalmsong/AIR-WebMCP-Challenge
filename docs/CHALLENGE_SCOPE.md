# Challenge Scope

## Pre-existing product

AIR 4.0 is an existing architectural AI workspace. Before the WebMCP Challenge it already contained the human-facing Editor, Gallery, image generation, AREA/Draw interaction, Moodboard, Mix, Context, Finish and Video product surfaces.

Those existing production capabilities are not claimed here as challenge-period inventions.

## Challenge-period work

The WebMCP Challenge work added an agent-native capability layer around the existing product. The goal was to let an agent use AIR's real design capabilities and state without pretending to be a human clicking through the UI.

The main additions were:

- WebMCP registration of high-level AIR actions.
- Direct latest-design loading without Gallery navigation.
- Structural canvas/context inspection.
- Agent-authored visible Draw markup with no image generation.
- Structured sketch context that can be read back after human edits.
- Agent-authored AREA proposals with no image generation.
- Localized image execution that reuses AIR's native AREA workflow.
- Structural Moodboard, Mix, persistent Context and Video access.
- Reuse of native Finish actions.
- An opt-in `?demo=1` caption layer for challenge recording, driven only by real AIR/WebMCP events.

## Core product boundary

The extension follows four boundaries:

1. **Use capabilities, not click imitation.** If AIR already exposes a function, WebMCP calls the function/state boundary rather than reproducing pointer interaction.
2. **Generation is separate from communication.** Draw and AREA markup can be used to discuss intent without spending credits or producing a new image.
3. **Persistent context changes are explicit.** One-off edits do not silently mutate long-term project context.
4. **The agent keeps semantic judgement.** AIR exposes concise actions and current state; the connected model decides when to use them rather than following a large regex/routing ruleset.

## Shared Markup flow

The challenge's central new interaction is bidirectional shared markup:

```text
Agent reads current design
        ↓
Agent draws proposal on AIR canvas
        ↓
Human sees / edits proposal
        ↓
AIR publishes updated structured sketch
        ↓
Agent reads the human change
        ↓
Agent proposes AREA
        ↓
Human approves
        ↓
AIR executes localized generation
```

During end-to-end testing, Draw and AREA proposals did not change History or credits before generation. Only the approved image generation created a History entry and consumed credits.

## Production vs public repository

The commercial AIR 4.0 repository contains unrelated proprietary application code, credentials/infrastructure assumptions, provider integrations and business logic. It remains private.

This Challenge Edition publishes the WebMCP interaction pattern, challenge-period implementation material and runnable reference code under Apache-2.0. It does **not** relicense the full AIR 4.0 product.
