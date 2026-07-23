# AGENTS.md

Guidance for AI coding agents working in this repo. See `CLAUDE.md` for the full architecture reference — keep both files in sync.

## Run

```bash
npm install && NODE_OPTIONS=--use-system-ca node server.js
# http://localhost:3000
```

No build step, no test suite, no linter.

## Two-model workflow

| Role | Model | Responsibility |
|------|-------|----------------|
| Architect | Opus | Planning, spec writing, design direction |
| Implementer | Sonnet | Implementation, module by module |

## Key rules

**Config is the source of truth.**
`world/config.js` holds all interactable positions, radii, prompts, and modal names. Edit there first, never hardcode values in other modules.

**Every route needs two entries.**
`server.js` (local dev) and `vercel.json` (production). Miss one and it 404s in prod.

**Nav is copy-pasted.**
Nav markup, Tailwind config, CSS tokens, and font links are duplicated across all HTML pages. Changing a nav link or shared style means editing every file.

**`/home` must always work.**
It is the mobile and no-WebGL fallback. The guard in `world/main.js` redirects at load time.

**No bundler.**
Three.js loads via CDN importmap. Keep it that way.

**Interaction is click-based, not E key.**
The `interaction.js` proximity loop fires on `mousedown`. Do not add E-key interaction.

**No long dashes.**
Never use em dashes or en dashes in any content, copy, labels, or commit messages. Use commas, colons, or parentheses instead.

**No AI design patterns in UI.**
No gradient fills, no box-shadow glows, no `border-radius: 16px` cards, no gradient text. Both the 3D overlays and the classic site use flat backgrounds with hairline borders.

**Accent is links-only.**
`--accent: #1d4ed8` (classic site) and `--accent: #1d4ed8` (3D UI) appear on links and accent ticks only. Never as button fills, border highlights, or text colors for non-links.

**Font rule (3D UI).**
No Press Start 2P in UI chrome. Use Bricolage Grotesque 500 (headings), IBM Plex Mono (labels/dates), Source Serif 4 (prose).

**Music toggle is M key.**
Background music starts on "Enter World" click. M key toggles mute. No clickable button (pointer is locked during gameplay).
