# Challenge Scope

## Pre-existing product

AIR 4.0 is an existing architectural AI workspace. Before the WebMCP Challenge it already contained the human-facing Editor, Gallery, image generation, AREA/Draw interaction, Moodboard, Mix, Context, Finish, and Video product surfaces.

Those existing production capabilities are not claimed here as Challenge-period inventions.

## Challenge-period work

The WebMCP Challenge work added an agent-native capability layer around the existing product. The goal was to let an agent use AIR's real design capabilities and state without pretending to be a human clicking through the UI.

The main additions were:

- WebMCP registration of high-level AIR actions.
- Direct design loading without Gallery-style navigation.
- Structural canvas/context inspection.
- Agent-authored visible Draw markup with no image generation.
- Structured sketch context that can be read back after human edits.
- Agent-authored AREA proposals with no image generation.
- Localized image execution that reuses AIR's native workflow.
- Structural Moodboard, Mix, persistent Context, and Video access.
- Reuse of native Finish actions.

## Core product boundary

The extension follows four boundaries:

1. **Use capabilities, not click imitation.** If AIR already exposes a function, WebMCP calls the function/state boundary rather than reproducing pointer interaction.
2. **Generation is separate from communication.** Draw and AREA markup can be used to discuss intent without spending credits or producing a new image.
3. **Persistent context changes are explicit.** One-off edits do not silently mutate long-term project context.
4. **The agent keeps semantic judgement.** AIR exposes concise actions and current state; the connected model decides when to use them rather than following a large regex/routing ruleset.

## Shared markup flow

The Challenge's central new interaction is bidirectional shared markup:

```text
Agent reads current design
        ↓
Agent marks or sketches on AIR canvas
        ↓
Human sees / edits the proposal
        ↓
AIR publishes updated structured context
        ↓
Agent reads the human change
        ↓
Human confirms the design decision
        ↓
AIR executes the agreed action
```

The key boundary is that visible markup can exist independently of generation. The design conversation can happen on the artifact before execution.

## Production vs. public repository

The commercial AIR 4.0 repository contains unrelated proprietary application code, infrastructure assumptions, provider integrations, and business logic. It remains private.

This Challenge Edition publishes the WebMCP interaction pattern, Challenge-period implementation material, and runnable reference code under Apache-2.0. It does **not** relicense the full AIR 4.0 product.

No production credentials, API keys, account data, or judge/test credentials are included in this repository.
