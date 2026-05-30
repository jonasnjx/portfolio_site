# AGENTS.md

Guidance for AI coding agents working in this repo. See `CLAUDE.md` for the full architecture reference — keep both files in sync.

## Run

```bash
npm install && npm start
# → http://localhost:3000
```

No build step, no test suite, no linter.

## Two-model workflow (reference implementation)

This project is a working example of building with Claude Code using a planned, two-model approach:

| Role | Model | Responsibility |
|------|-------|---------------|
| Architect | **Opus** | Wrote the spec before any code: room layout, interaction model, file structure, build order |
| Implementer | **Sonnet** | Built each module in order, one independently-testable step at a time |

**Why this works:** Opus produces a detailed, opinionated spec. Sonnet executes it in small, reviewable chunks. No half-finished implementations, no speculative abstractions.

## Key rules for agents working here

- **`world/config.js` is the single source of truth** for all interactable positions, radii, prompts, and modal names. Edit there first — never hardcode values in other modules.
- **Every route needs two entries**: `server.js` (local dev) and `vercel.json` (production). Miss one and it 404s in prod.
- **Nav markup is copy-pasted** across all HTML pages — changing a nav link means editing every file.
- **`/home` must always work** — it's the mobile and no-WebGL fallback. Don't break it.
- **No bundler.** Three.js loads via CDN importmap. Keep it that way unless there's a strong reason to introduce a build step.
- **Mobile users never see the 3D world.** The guard in `world/main.js` redirects them to `/home` at load time.
