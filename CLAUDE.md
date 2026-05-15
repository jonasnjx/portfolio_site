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

## Architecture

**No component system.** Every page is a self-contained HTML file. Shared code — the Tailwind config, custom CSS classes, and navigation markup — is copy-pasted into each file. When changing a shared element (nav links, color palette, CSS classes), update every HTML file.

**Styling pattern.** Tailwind CSS is loaded via CDN. The Tailwind theme config (custom `dark` and `accent` colors, `Space Grotesk`/`JetBrains Mono` fonts) is embedded in a `<script>` tag in every page's `<head>`. Custom utility classes (`.card`, `.gradient-text`, `.gradient-bg`, `.nav-link`, `.fade-in`, `.glow`, `.profile-glow`, `.skill-card`) are defined in a `<style>` block in every page — same content repeated.

**File structure:**
```
index.html                        # Home — Hero, About, Tech Stack
pages/
  resume.html                     # Work experience and internships
  projects.html                   # Project cards
  casestudies.html                # Article listing
  connect.html                    # LinkedIn and GitHub links
  casestudies/
    data-ai-2025.html             # Full case study article
assets/                           # Images only
```

**Routes** (all defined in `server.js`):
- `/` → `index.html`
- `/resume`, `/projects`, `/casestudies`, `/connect` → corresponding file in `pages/`
- `/casestudies/data-ai-2025` → `pages/casestudies/data-ai-2025.html`

All internal links and asset paths use absolute paths (e.g. `/resume`, `/assets/sea.jpg`) so they work regardless of file depth. Adding a new page requires both creating the HTML file and adding a route in `server.js`.
