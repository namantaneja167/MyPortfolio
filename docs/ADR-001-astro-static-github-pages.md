# ADR-001: Adopt Astro Static Build + GitHub Actions → GitHub Pages

**Date:** 2026-05-11  
**Status:** Accepted  
**Deciders:** Naman Taneja

---

## Context

The portfolio is currently a vanilla HTML5/CSS3/ES5 static site served directly from the repository root. It works locally via `file://` and can be hosted on any static host, but has no build step, no dependency management, no modular CSS, and no content separation from markup.

**Pain points identified:**

| Problem | Impact |
|---------|--------|
| 3400-line monolithic `style.css` | Hard to maintain; dead selectors accumulate |
| Content hardcoded in HTML | Updates require hand-editing markup |
| No content schema | Malformed data silently ships |
| No CI/CD | Deployments are manual and unreliable |
| No performance budget enforcement | Regressions go undetected |
| JS files use IIFE pattern, no modules | Cannot tree-shake or lint properly |

---

## Decision

Migrate to **Astro** (static output mode) with deployment via **GitHub Actions → GitHub Pages**.

### Why Astro

- Zero-JS-by-default: ships only HTML+CSS unless components opt in — perfect for a portfolio
- Supports vanilla `.astro` components (HTML + scoped CSS + minimal JS) without introducing a heavy framework
- Content Collections with Zod schema validation — exactly what's needed for typed experience/projects/skills data
- First-class static site generation; `output: 'static'` produces a deterministic `/dist`
- Incremental adoption: existing CSS and JS can be imported as-is initially
- Astro's `<style>` scoping prevents the global-bleed problem in the current monolith

### Why GitHub Actions → GitHub Pages

- Free hosting for public repos; no third-party service dependency
- `actions/upload-pages-artifact` + `actions/deploy-pages` is the official, stable pipeline
- Deterministic: build runs in a clean environment on every push to `main`
- Rollback: re-deploy any previous commit via GitHub UI

### Alternatives Rejected

| Alternative | Reason rejected |
|-------------|----------------|
| Vercel / Netlify | Adds external service dependency; GH Pages is sufficient |
| Next.js | Overkill for a static portfolio; larger bundle, more complexity |
| Vite + vanilla HTML | Better than status quo but no content collections or component model |
| Keep vanilla, add PostCSS | Doesn't solve content coupling or schema validation |

---

## Consequences

### Positive
- CSS split into layers: tokens → reset → layout → components → themes → utilities
- Content in typed JSON collections; build fails on malformed data
- CI enforces build integrity on every PR
- Performance budget can be checked as a CI step

### Negative / Risks
- Migration effort: ~1-2 days to convert sections to `.astro` components
- `file://` compatibility lost (need `npm run dev` or `npx astro preview`)
- Team must learn minimal Astro syntax (low barrier, but still a change)

### Mitigation
- Keep `index.html` in root as a frozen reference until cutover is verified
- Migration gates (see `MIGRATION-GATES.md`) must pass before removing the reference file
- Rollback: revert to `index.html` + remove `dist/` branch at any time

---

## Target Architecture

```
MyPortfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI: install → build → deploy Pages
├── docs/
│   ├── ADR-001-astro-static-github-pages.md
│   └── MIGRATION-GATES.md
├── public/                     # Static assets (copied as-is to dist/)
│   ├── assets/
│   │   └── Naman_Resume.pdf
│   ├── images/
│   │   └── profile.jpg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── content/                # Typed content collections
│   │   ├── experience.json
│   │   ├── projects.json
│   │   ├── skills.json
│   │   └── profile.json
│   ├── layouts/
│   │   └── Base.astro          # <html>, <head>, global meta
│   ├── pages/
│   │   └── index.astro         # Composes all sections
│   ├── sections/               # One .astro per nav section
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Experience.astro
│   │   ├── Skills.astro
│   │   ├── Projects.astro
│   │   ├── Writing.astro
│   │   └── Contact.astro
│   ├── components/             # Reusable sub-components
│   │   ├── NavBar.astro
│   │   ├── Footer.astro
│   │   ├── ChatWidget.astro
│   │   └── ThemeToggle.astro
│   ├── scripts/                # Client-side JS modules
│   │   ├── main.js
│   │   ├── ChatService.js
│   │   └── StateManager.js
│   └── styles/                 # CSS layers
│       ├── tokens.css
│       ├── reset.css
│       ├── layout.css
│       ├── themes.css
│       ├── utilities.css
│       └── components/
│           ├── navbar.css
│           ├── hero.css
│           ├── about.css
│           ├── experience.css
│           ├── skills.css
│           ├── projects.css
│           ├── writing.css
│           ├── contact.css
│           ├── footer.css
│           └── chat.css
├── astro.config.mjs
├── package.json
├── index.html                  # Frozen reference (deleted post-cutover)
└── ...agent/config files
```

---

## Implementation Phases

| Phase | Focus | Gate |
|-------|-------|------|
| 1 | Baseline + ADR | This document + `MIGRATION-GATES.md` exist |
| 2 | Repo structure | New folders created; root reference intact |
| 3 | Astro init + CI | `npm run build` succeeds; Pages deploys |
| 4 | CSS layers | All styles split; visual regression < 2% diff |
| 5 | Content collections | All data in JSON; build fails on bad schema |
