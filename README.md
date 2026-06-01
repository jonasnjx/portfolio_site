# Jonas Ng | Interactive Portfolio

A walkable 3D voxel room as the landing experience, plus a classic static site for mobile and fallback. Built with Three.js, plain HTML, and Express. No bundler.

## Architecture

```
  Visitor lands on jonasnjx.vercel.app
                  |
         ┌────────▼────────┐
         │  Mobile guard    │
         │  WebGL check     │
         └───┬─────────┬───┘
     mobile  │         │ desktop
     no-WebGL│         │
             ▼         ▼
     ┌──────────┐  ┌──────────────────────────────────────┐
     │  /home   │  │  / (3D interactive room)              │
     │  Classic │  │                                       │
     │  site    │  │  Three.js engine                      │
     └────┬─────┘  │  world/scene.js                       │
          │        │  world/room.js    (geometry, decor)    │
          │        │  world/controls.js  (WASD, camera)     │
          │        │  world/interaction.js  (click)          │
          │        │  world/entities.js  (pets)              │
          │        │                                       │
          │        │  Clickable objects                    │
          │        │  Resume / Arcade / Bookshelf /        │
          │        │  Telephone / Sofa / Clock / Door      │
          │        └──────────────┬───────────────────────┘
          │                       │
          │              ┌────────▼────────┐
          │              │  Baymax NPC      │
          │              │  Chat overlay    │
          │              └────────┬────────┘
          │                       │ POST /ask
          ├───────────────────────┘
          │
          ▼
    portfolio_ai_assistant (separate Vercel service)
    Groq llama-3.3-70b, Upstash Redis cache, rate limiting
          │
          ├── /resume, /projects, /casestudies, /connect
          │   /casestudies/*
          │         │
          │   AI chat widget (assets/chatbot.js) ─── POST /ask
          │
          ├── /dashboard
          │   Chart.js dashboard polling /stats every 30s
          │
          │        assets/track.js (paTrack, fire-and-forget)
          │                       │ POST /track
          │                       ▼
          │        portfolio_analytics (separate Vercel service)
          │        QStash ─► /consume ─► Redis counters
          │                                    │
          │                              GET /stats
          │
          ├── /home: Currently Building
          │         │ GET /api/roadmap
          │         ▼
          │   Linear GraphQL API (active tickets)
          │
          └── Deployed on Vercel
              vercel.json handles route rewrites
              api/roadmap.js is a serverless function
```

## The experience

Land on a third-person 3D room. Walk with WASD and click objects to explore. Mobile and no-WebGL visitors are redirected to `/home`.

| Object | Action |
|--------|--------|
| Resume desk | View work experience |
| Bookshelf | Read writing and articles |
| Arcade machine | Browse projects |
| Telephone | Contact links |
| Sofa | Sit down |
| Clock | Current Singapore time |
| Door | Exit to classic site |
| Baymax NPC | Talk to AI assistant |

`M` toggles background music. `T` or `Enter` opens chat.

## Getting started

```bash
npm install
NODE_OPTIONS=--use-system-ca node server.js
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
| `/casestudies` | Writing index |
| `/connect` | Social media |
| `/dashboard` | Live analytics dashboard |
| `/casestudies/<article>` | Article |

## Tech stack

- **Three.js** (CDN importmap, no bundler): 3D room, third-person camera, voxel geometry
- **Tailwind CSS** (CDN): classic site styling
- **Express.js**: local dev server
- **Vercel**: production deployment, serverless functions
- **Groq** (llama-3.3-70b-versatile): AI assistant inference via `portfolio_ai_assistant`
- **Upstash Redis**: response caching and rate limiting in `portfolio_ai_assistant`; event counters in `portfolio_analytics`
- **Upstash QStash**: HTTP message queue for analytics event pipeline
- **Chart.js**: analytics dashboard at `/dashboard`
- **Linear API**: roadmap tracking via `/api/roadmap`

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
  casestudies.html      # Writing index
  connect.html
  dashboard.html        # Analytics dashboard
  writings/
    portfolio-analytics-2026.html
    baymax-ai-assistant-2026.html
    context-engineering-2026.html
assets/
  track.js              # paTrack() — fire-and-forget analytics events
  chatbot.js            # AI chat widget (all classic pages)
  bg-music.mp3
  favicon.svg
  og-preview.png
api/
  roadmap.js            # Linear API route (Vercel serverless)
```

## Related services

| Repo | Purpose |
|------|---------|
| `portfolio_ai_assistant` | Baymax AI backend: Groq inference, Redis caching, rate limiting |
| `portfolio_analytics` | Event pipeline: /track, QStash, /consume, Redis, /stats |
