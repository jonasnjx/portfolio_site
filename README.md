# Jonas | AI Cloud & Data Engineer — Portfolio

An interactive portfolio with a first-person 3D voxel room as the landing experience. Built with Three.js, plain HTML, and Express — no bundler.

> Built with [Claude Code](https://claude.ai/code) — planned with Opus, implemented with Sonnet.

## The experience

Visitors land on a Minecraft-inspired room and walk around with WASD + mouse. Each object in the room links to a part of the portfolio:

| Object | Action |
|--------|--------|
| Resume desk | Press `E` → view / download resume |
| TV | Press `E` → watch intro video |
| Terminal kiosk | Press `E` → projects & case studies |
| Connect poster | Press `E` → LinkedIn & GitHub |

Mobile and no-WebGL visitors are redirected to the classic static site at `/home`.

## Getting started

```bash
npm install
npm start
# → http://localhost:3000
```

The site must be served through Express — opening HTML files directly won't work due to absolute routing.

## Routes

| Route | Description |
|-------|-------------|
| `/` | 3D interactive room (desktop only) |
| `/home` | Classic portfolio — mobile fallback |
| `/resume` | Work experience |
| `/projects` | Project showcase |
| `/casestudies` | AI & Data Engineering articles |
| `/connect` | LinkedIn, GitHub |

## Tech stack

- **Three.js** (via CDN importmap, no bundler) — 3D scene, PointerLockControls
- **Tailwind CSS** (CDN) — styling for overlays and classic pages
- **Express.js** — local dev server
- **Vercel** — production deployment

## File structure

```
index.html          # 3D launcher (onboarding overlay + canvas)
world/              # Three.js modules
  config.js         # All positions, colors, object data
  main.js           # Boot, render loop, modal wiring
  scene.js          # Renderer, camera, lights, fog
  room.js           # Room geometry + decor
  interactables.js  # Resume, TV, terminal, connect objects
  controls.js       # WASD movement + head bob
  interaction.js    # Proximity detection + E-key
pages/
  home.html         # Classic homepage (mobile fallback)
  resume.html
  projects.html
  casestudies.html
  connect.html
assets/             # Images, resume PDF, intro video
```

## Deployment

Deployed on Vercel. `vercel.json` handles route rewrites. Any new route must be added to both `server.js` and `vercel.json`.
