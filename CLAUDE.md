# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run local dev server at http://localhost:3000
npm start
```

There is no build step, bundler, linter, or test suite. The site is pure static HTML served by Express.

## How this repo is built: Claude Code workflow

This site was planned and implemented with **Claude Code** using a two-model split:
- **Opus** — architecture planning, spec writing, file layout decisions
- **Sonnet** — implementation, module by module

The spec was written before any code. When extending the room or adding pages, update `world/config.js` and this file together.

---

## Architecture

### Homepage: 3D Interactive Room

`/` is a Three.js first-person voxel room (Minecraft-inspired). Visitors walk around with WASD + mouse and interact with objects (resume, TV intro, terminal, connect poster).

`/home` is the classic static portfolio — the fallback for mobile, no-WebGL browsers, and the "Skip" button.

**3D modules** (no bundler — ES modules via CDN importmap in `index.html`):

```
world/
  config.js        # Single source of truth: positions, colors, radii, prompts
  main.js          # Entry: mobile/WebGL guard, boot sequence, render loop
  scene.js         # Renderer, camera, lights, fog
  room.js          # Static geometry: floor, walls, ceiling, decor
  interactables.js # Resume desk, TV, terminal, connect — returns registry array
  controls.js      # PointerLockControls + WASD movement + room-bounds collision
  interaction.js   # Proximity focus loop + E-key dispatch
```

Three.js is pinned at `0.160.0` via importmap. All interactables are data-driven through `config.js` — add a new object there, never hardcode per-object logic in other files.

**Mobile / fallback guard** in `world/main.js`: redirects to `/home` on touch devices, narrow viewports (<820px), missing WebGL, or no Pointer Lock API.

### Classic static site (`/home` + all other pages)

**No component system.** Every page is a self-contained HTML file. Shared code — the Tailwind config, custom CSS classes, and navigation markup — is copy-pasted into each file. When changing a shared element (nav links, color palette, CSS classes), update every HTML file.

**Styling pattern.** Tailwind CSS is loaded via CDN. The Tailwind theme config (custom `dark` and `accent` colors, `Space Grotesk`/`JetBrains Mono` fonts) is embedded in a `<script>` tag in every page's `<head>`. Custom utility classes are defined in a `<style>` block in every page.

**File structure:**
```
index.html                        # 3D world launcher (importmap + onboarding overlay + canvas)
pages/
  home.html                       # Classic homepage (hero, about, tech stack) — mobile fallback
  resume.html                     # Work experience and internships
  projects.html                   # Project cards
  casestudies.html                # Article listing
  connect.html                    # LinkedIn and GitHub links
  casestudies/
    data-ai-2025.html             # Full case study article
assets/                           # Images, resume PDF, intro video
world/                            # Three.js 3D world modules (ES modules)
```

**Routes** (defined in both `server.js` for local dev AND `vercel.json` for production):
- `/` → `index.html` (3D launcher)
- `/home` → `pages/home.html` (classic site)
- `/resume`, `/projects`, `/casestudies`, `/connect` → corresponding file in `pages/`
- `/casestudies/data-ai-2025` → `pages/casestudies/data-ai-2025.html`

> Any new route must be added to **both** `server.js` and `vercel.json` or it will 404 in production.

All internal links and asset paths use absolute paths (e.g. `/resume`, `/assets/sea.jpg`).

### Adding a new interactable object to the room

1. Add an entry to `INTERACTABLES` in `world/config.js` (id, position, radius, prompt, modal or href)
2. Build the geometry in `world/interactables.js` using the config entry
3. If it opens a modal: add the modal HTML to `index.html` and handle it in `openModal()` in `world/main.js`
4. No changes needed in `interaction.js` — it reads the registry dynamically
