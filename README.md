# AIR × WebMCP Challenge Edition

**A shared architectural design canvas for humans and agents.**

AIR is an architectural AI workspace. For the WebMCP Challenge, AIR was extended so an AI agent can participate in the same live design canvas as the architect instead of imitating browser clicks.

> The agent doesn't imitate AIR's UI. It uses AIR's capabilities.

## What this challenge work adds

The production AIR 4.0 application existed before the challenge. The work documented here focuses on the WebMCP extension created during the challenge period:

- Load the current architectural design structurally through WebMCP.
- Read live canvas and design state.
- Let the agent place visible Draw annotations before generation.
- Let the architect edit the same sketch and expose those changes back as structured design context.
- Let the agent propose an exact AREA without generating anything.
- Execute a localized design change only after intent is clear.
- Reuse AIR's native image, Moodboard, Context, Mix, Finish, and Video workflows instead of creating a parallel automation layer.
- Keep human UI navigation optional; WebMCP actions use product capabilities directly rather than browser-coordinate clicking.

## Core interaction

```text
Architect intent
      ↓
  ChatGPT / Agent
      ↓ WebMCP
AIR shared canvas
  ↕        ↕
Draw      AREA
  ↕        ↕
Human edits / confirms
      ↓
AIR native execution
```

The key design loop is:

**Understand → Mark up → Discuss → Agree → Execute**

This is intentionally different from a conventional prompt-to-image workflow. AIR can use visible markup as a communication layer before spending credits or generating a new image.

## Live demo

Production challenge demo:

`https://img.airtect.kr/editor?demo=1`

The live product requires an AIR account. Submission testing credentials can be supplied separately through the challenge submission when needed.

`?demo=1` only adds short event-driven presentation captions for recording. It does not add extra WebMCP capabilities or change normal AIR behavior.

## Repository scope

The commercial AIR 4.0 production repository remains private. This repository is the public-safe Challenge Edition and will contain:

- the WebMCP interaction model and selected challenge-period source;
- a runnable reference implementation of the shared-canvas WebMCP pattern;
- architecture notes and challenge-period change documentation;
- setup and demo instructions;
- an open-source license for the material published here.

The Challenge Edition is intentionally separated from unrelated proprietary AIR production code, credentials, provider integrations, and commercial infrastructure.

## Challenge-period implementation

The WebMCP extension was developed after August 25, 2026. The main new interaction is the bidirectional shared-canvas workflow:

1. Agent reads AIR state directly.
2. Agent draws a visible design proposal without generating.
3. Human can modify the proposal.
4. Agent reads the modified sketch as structured context.
5. Agent proposes an AREA.
6. Human approves.
7. AIR executes through its existing native generation workflow.

See [`docs/CHALLENGE_SCOPE.md`](docs/CHALLENGE_SCOPE.md) for the separation between pre-existing AIR and challenge-period work.

## Status

- Production WebMCP workflow: tested end-to-end.
- Shared Markup: tested end-to-end.
- Caption-only recording mode: tested in production build.
- Public Challenge Edition packaging: in progress in this repository.

## License

The material published in this repository is licensed under the Apache License 2.0. See [`LICENSE`](LICENSE).

AIR 4.0 itself is a separate commercial product and is not relicensed by this repository.
