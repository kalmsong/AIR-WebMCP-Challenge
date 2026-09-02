# Demo Recording Plan

Target length: **about 1:45–2:10**. Keep the edit minimal: one screen recording, event-driven AIR captions, and one short external narration clip if desired.

## Opening narration (optional, ~15–20 seconds)

> AIR turns an architectural web application into a shared workspace for humans and AI. Through WebMCP, the agent can understand the current design, sketch directly on the same canvas, read the architect's changes, point to an exact region, and only then execute the agreed design.

This narration can be generated separately with a high-quality voice service and placed once at the beginning. No browser TTS is used.

## One-shot agent prompt

Use the live demo URL with `?demo=1`, then ask the connected agent:

> Run a short AIR WebMCP design demo. Load my latest AIR design. Show me how you would strengthen the facade rhythm by drawing your proposal directly on the canvas, but do not generate anything yet. Read the shared sketch back as design context, explain the design intent briefly, and mark the exact part you would change with AREA. Stop after AREA and wait for my approval. Do not render until I approve.

## Flow

### 1. Direct design entry

The agent loads the latest AIR design without opening Gallery. The AIR demo caption explains that WebMCP is using product state/capabilities rather than human-style navigation.

### 2. Agent markup

The agent places Draw lines and a short note on the live canvas. No image is generated and no credits are consumed.

### 3. Shared sketch context

AIR exposes the visible sketch as structured design context. If useful for the recording, the architect can alter one line before the agent reads it back.

### 4. AREA proposal

The agent marks the exact design region it intends to change, still without generating.

### 5. One human approval

Type one short response:

> Yes. Change only that area to light warm stone.

### 6. Native AIR execution

AIR runs the localized edit through its existing generation workflow. Show the final result and History briefly.

## Ending line

Suggested final on-screen or submission copy:

**The agent doesn't imitate AIR's UI. It uses AIR's capabilities — on the same canvas as the architect.**
