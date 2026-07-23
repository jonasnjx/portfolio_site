# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
NODE_OPTIONS=--use-system-ca node server.js   # SSL workaround on this machine
# http://localhost:3000
```

No build step, bundler, linter, or test suite. Pure static HTML served by Express.

## How this repo is built

Built with Claude Code using a two-model split: Opus for architecture and planning, Sonnet for implementation. When extending the room or adding pages, update `world/config.js` and this file together.

---

## Architecture

### 3D Interactive Room (`/`)

Third-person walkable voxel room built with Three.js. Visitors use WASD to move and click on objects to interact. Mobile and no-WebGL browsers are redirected to `/home`.

**Interaction model:** click-based proximity detection (no E key). Objects are registered in `INTERACTABLES` in `config.js`. The `interaction.js` proximity loop reads this registry dynamically.

**Current interactables:**

| id | position | action |
|----|----------|--------|
| resume | x=0, z=-4.5 | opens resume modal |
| arcade | x=-3.2, z=-2.2 | opens projects modal |
| bookshelf | x=-4.6, z=1.8 | opens writing modal |
| telephone | x=4.4, z=0.2 | opens contact modal |
| sofa | x=3.6, z=2.2 | sit/stand |
| clock | x=1.6, z=-4.8 | shows live SGT time |
| door | x=0, z=5.2 | navigates to /home |

Player spawns at x=0, z=4.6 (just inside south door), SPAWN_YAW=0 (camera looks north into room).

**3D modules** (ES modules via CDN importmap in `index.html`):

```
world/
  config.js         # Single source of truth: positions, colors, INTERACTABLES
  main.js           # Boot sequence, render loop, modals, chat, music
  scene.js          # Renderer, camera, lights
  room.js           # Room geometry, decor, signs, door
  character.js      # 6 character meshes + 2D pixel art previews
  controls.js       # Third-person camera, WASD movement, sit/stand
  interaction.js    # Click-based proximity interaction
  interactables.js  # Interactable object builders
  entities.js       # Pets: giraffe, dino, polar bear
```

**Adding a new interactable:**
1. Add entry to `INTERACTABLES` in `world/config.js` (id, position, radius, prompt, modal or href)
2. Build geometry in `world/room.js` or `world/interactables.js`
3. If it opens a modal: add modal HTML to `index.html`, add key to `modals` map in `world/main.js`, handle in `openModal()`
4. No changes needed in `interaction.js` — reads registry dynamically

**UI design (3D overlays):** dark theme with tokens defined in `index.html` `<style>`:
```css
--bg: #0f1117  --bg-2: #161922  --ink: #ececec
--muted: #9a9a9a  --rule: #e2ded5  --accent: #1d4ed8
```
No gradients, no glows. Hairline `rgba(226,222,213,0.14)` borders. No Press Start 2P anywhere in UI chrome. Fonts: Bricolage Grotesque 500 (headings), IBM Plex Mono (labels), Source Serif 4 (prose). Accent (#1d4ed8) on links only.

**Keyboard shortcuts in-game:** WASD move, Space jump, M mute/unmute, T or Enter open chat, Esc close modal or pause.

---

### Classic site (`/home` + all pages)

**Design system: "Field Notes" (light editorial theme)**

```css
--paper: #f7f5f0  --ink: #1a1a1a  --muted: #6b6b6b
--rule: #e2ded5  --accent: #1d4ed8
```

Fonts: Bricolage Grotesque 500 (headings), Source Serif 4 (body prose), IBM Plex Mono (dates, labels, mono). No gradients, no glows, no dark cards. Hairline `1px solid var(--rule)` dividers. Accent on links only, never fills.

No component system. Every page is self-contained HTML. Nav markup, Tailwind config, CSS tokens, and font links are copy-pasted into each file. When changing a shared element, update every HTML file.

**Pages:**
```
pages/
  home.html                             # Hero, background, tech stack, roadmap
  resume.html                           # Timeline layout
  projects.html                         # Index rows with status badges + Linear tooltip
  casestudies.html                      # Writing index (listed articles with bylines)
  connect.html                          # Contact links
  dashboard.html                        # Live analytics dashboard (Chart.js, polls /stats every 30s)
  baymax.html                           # Baymax model evaluation card (reads eval JSON from GitHub raw)
  writings/                             # Article files (folder is writings/, URLs stay /casestudies/*)
    enterprise-data-catalog-2026.html   # Article: 4 min read
    portfolio-analytics-2026.html       # Article: 2 min read
    baymax-ai-assistant-2026.html       # Article: 3 min read
    context-engineering-2026.html       # Article: 2 min read
```

**Routes** (must be in both `server.js` and `vercel.json`):
- `/` → `index.html`
- `/home` → `pages/home.html`
- `/resume`, `/projects`, `/casestudies`, `/connect`, `/dashboard`, `/baymax` → corresponding pages
- `/casestudies/enterprise-data-catalog-2026` → `pages/writings/enterprise-data-catalog-2026.html`
- `/casestudies/portfolio-analytics-2026` → `pages/writings/portfolio-analytics-2026.html`
- `/casestudies/baymax-ai-assistant-2026` → `pages/writings/baymax-ai-assistant-2026.html`
- `/casestudies/context-engineering-2026` → `pages/writings/context-engineering-2026.html`

Article URLs use the `/casestudies/` prefix for backward compatibility; the physical folder is `pages/writings/`.

**Article format:** header has `Jonas Ng · N min read` byline in IBM Plex Mono. Reading times: portfolio-analytics = 2 min, baymax = 3 min, context-engineering = 2 min. Update both the article file and the `casestudies.html` listing when adding or changing articles.

**Hero CTAs on `/home`:** three inline links: "View Resume" (button), "Enter 3D room →" (accent text), "View site analytics →" (muted text).

**"Currently Building" section on `/home`:** fetches from `/api/roadmap` (Linear API, `api/roadmap.js`), groups tickets by `project.name`, shows descriptions. Requires `LINEAR_API_KEY` in `.env`.

---

### Analytics tracking

`assets/track.js` defines `window.paTrack(type, props)` using `fetch` (fire-and-forget). It auto-fires a `page_view` event on classic pages and is loaded in both `index.html` and every `pages/*.html`.

- Tracking endpoint: `https://portfolio-analytics-plum.vercel.app/track`
- Event types: `page_view`, `room_enter`, `object_click`, etc.
- The 3D room fires `room_enter` and `object_click` events manually via `paTrack()` calls in `world/main.js`
- Analytics pipeline lives in a separate repo (`portfolio_analytics`): QStash → `/consume` → Redis → `/stats` → dashboard

---

### Baymax model evaluation card (`/baymax`)

`pages/baymax.html` is a public model evaluation card for the Baymax chatbot. It is a read-only dashboard that fetches eval results directly from the `portfolio_ai_assistant` repo via GitHub raw URLs (no backend, no DB).

- Data source: `https://raw.githubusercontent.com/jonasnjx/portfolio_ai_assistant/master/eval/{index.json, changelog.json, results/<runId>.json}`
- Fetches use cache-busting (`?t=<ts>` + `cache: 'no-store'`) so the latest run always shows. GitHub raw CDN still caches ~5 min after a push.
- Shows: current scores (overall/accuracy/relevance/conciseness with hover tooltips), eval setup (LangGraph pipeline, generator/judge models, question count), and an expandable run history (per-question scores, latency, full answer, judge reasoning).
- Discovery: "Model Card →" link in the chatbot widget header (`assets/chatbot.js`) and a "Baymax Model Card →" link on the analytics dashboard header.

The eval pipeline itself (LangGraph agent, LLM-as-judge, golden dataset, runner, compare) lives in `portfolio_ai_assistant/eval/`. Jonas runs `node eval/run.js` locally after a meaningful change, adds a one-line note to `eval/changelog.json`, and commits. The card updates automatically on push.

**Writing style rule:** no long dashes (em or en). Use commas, colons, or parentheses instead.
