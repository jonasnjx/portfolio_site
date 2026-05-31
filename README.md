# Jonas Ng | Senior Data & Cloud Engineer

An interactive portfolio with a walkable 3D voxel room as the landing experience, plus a classic static site for mobile and fallback. Built with Three.js, plain HTML, and Express. No bundler.

> Built with [Claude Code](https://claude.ai/code). Planned with Opus, implemented with Sonnet.

## The experience

Desktop visitors land on a third-person 3D room. Walk around with WASD and click on objects to explore the portfolio. Mobile and no-WebGL visitors are redirected to the classic site at `/home`.

| Object | Action |
|--------|--------|
| Resume desk | View work experience |
| Bookshelf | Read writing and articles |
| Arcade machine | Browse projects |
| Telephone | Contact links |
| Sofa | Sit down |
| Clock | Current Singapore time |
| Door | Exit to classic site |

Press `M` to toggle background music. Press `T` or `Enter` to open the chat (type `/help` for commands).

## Getting started

```bash
npm install
npm start
# http://localhost:3000
```

The site must be served through Express. Opening HTML files directly won't work due to absolute routing.

## Routes

| Route | Description |
|-------|-------------|
| `/` | 3D interactive room (desktop only) |
| `/home` | Classic portfolio, mobile fallback |
| `/resume` | Work experience |
| `/projects` | Projects |
| `/casestudies` | Writing |
| `/connect` | LinkedIn, GitHub, Email |
| `/casestudies/context-engineering-2026` | Article |
| `/casestudies/data-ai-2025` | Article |

Any new route must be added to both `server.js` and `vercel.json`.

## Tech stack

- **Three.js** (via CDN importmap, no bundler): 3D room, third-person camera, voxel geometry
- **Tailwind CSS** (CDN): classic site styling
- **Express.js**: local dev server
- **Vercel**: production deployment
- **Linear**: roadmap tracking via API

## File structure

```
index.html              # 3D launcher (onboarding overlay + canvas)
world/
  config.js             # Positions, colors, interactables registry
  main.js               # Boot sequence, render loop, modals, chat
  scene.js              # Renderer, camera, lights
  room.js               # Room geometry, decor, signs
  character.js          # Character meshes, pixel art previews
  controls.js           # WASD movement, third-person camera
  interaction.js        # Click-based proximity interaction
  interactables.js      # Interactable object builders
  entities.js           # Pets (giraffe, dino, polar bear)
pages/
  home.html             # Classic homepage
  resume.html
  projects.html
  casestudies.html
  connect.html
  casestudies/
    context-engineering-2026.html
    data-ai-2025.html
assets/                 # Images, audio, favicon, OG image
api/
  roadmap.js            # Linear API route (Vercel serverless)
```

## Deployment

Deployed on Vercel. `vercel.json` handles route rewrites.
