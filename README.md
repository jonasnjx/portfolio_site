# Portfolio Website

A modern, responsive portfolio website built with HTML, Tailwind CSS, and vanilla JavaScript.

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Express.js (local dev server)
- Google Fonts (Space Grotesk, JetBrains Mono)

## Getting Started

```bash
npm install
npm start
```

Then visit `http://localhost:3000`. The site must be served through Express — opening HTML files directly in the browser won't work due to absolute routing paths.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero section with profile, about me, hobbies, and tech stack |
| `/resume` | Professional experience and internships |
| `/projects` | Showcase of personal projects |
| `/casestudies` | Industry insights and research on AI & Data Engineering |
| `/connect` | Social media links (LinkedIn, GitHub) |

## File Structure

```
index.html
pages/
  resume.html
  projects.html
  casestudies.html
  connect.html
  casestudies/
    data-ai-2025.html
assets/
server.js
```

## Deployment

Since routing is handled by Express, deploy to a platform that supports Node.js servers:
- Render
- Railway
- Fly.io
- Vercel (with a `vercel.json` rewrites config)

## License

MIT
