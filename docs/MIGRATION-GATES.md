# Migration Gates

All gates must pass before the frozen `index.html` reference is removed and the Astro build becomes the sole source of truth.

---

## Phase 1 — Foundation Lock

- [x] File inventory captured (see below)
- [x] ADR-001 written and committed
- [x] This file exists

### Baseline Metrics (captured 2026-05-11)

| File | Lines |
|------|-------|
| `index.html` | 610 |
| `css/style.css` | 2384 |
| `js/main.js` | 634 |
| `js/data.js` | 127 |
| `js/ChatService.js` | 99 |
| `js/StateManager.js` | 118 |

### Dependency Inventory

| Library | Version | Load method |
|---------|---------|-------------|
| AOS (Animate On Scroll) | 2.3.1 | CDN `<link>` + `<script>` |
| Boxicons | 2.1.4 | CDN `<link>` |
| Formspree | — | Form `action="https://formspree.io/f/xvgebpon"` |
| RSS2JSON API | — | `fetch()` in `initBlogPosts` |
| Google Fonts (Figtree, Inconsolata, Barlow Semi Condensed) | — | CDN `<link>` |

### Design Tokens

| Token | Value | Role |
|-------|-------|------|
| `--accent` | `#C06D6D` | CTAs, actions (terracotta) |
| `--accent-cool` | `#4F8FAD` (dark) / `#3A7A97` (light) | Metadata, waypoints (steel-blue) |
| `--bg-primary` | `#0D0B09` (dark) / `#F8F7F4` (light) | Page background |
| `--text-primary` | `#F0EDE8` (dark) / `#221E1A` (light) | Body copy |
| Font: display | Barlow Semi Condensed | Hero/section headings |
| Font: prose | Figtree | Body, nav, UI |
| Font: mono | Inconsolata | Labels, code |

---

## Phase 2 — Repo Structure

- [x] `src/`, `public/`, `docs/`, `.github/workflows/` folders created
- [x] Static assets moved to `public/` (`images/`, `assets/`, `manifest.json`, `sw.js`)
- [x] JS files copied to `src/scripts/`
- [x] Root `index.html` still present and working as frozen reference

---

## Phase 3 — Astro Build + CI

- [x] `package.json` present with Astro dependency
- [x] `astro.config.mjs` configured (`output: 'static'`, `site`, `base`)
- [x] `npm run build` exits 0 locally
- [x] `.github/workflows/deploy.yml` present
- [ ] GitHub Pages source set to GitHub Actions in repo settings
- [ ] First deployment succeeds at `https://namantaneja167.github.io/MyPortfolio/`

---

## Phase 4 — CSS Architecture

- [x] `css/style.css` monolith split into layer files under `src/styles/`
- [x] CSS layers declared in correct order: tokens → reset → layout → components → themes → utilities
- [x] No selector from the original stylesheet is missing from the split files
- [x] Dead selectors documented (not deleted until Phase 5 verification)
- [ ] Visual comparison: dark mode and light mode render identical to baseline screenshots

---

## Phase 5 — Content Collections

- [x] `src/content/experience.json` — 3 entries, matches current HTML
- [x] `src/content/projects.json` — all projects, matches current HTML
- [x] `src/content/skills.json` — all 5 skill rows, matches current HTML
- [x] `src/content/profile.json` — name, title, tagline, email, social links
- [x] Zod schema validation runs at build time; invalid data causes build failure
- [x] All hardcoded content removed from `.astro` section files; data comes from collections

---

## Cutover Checklist (Post Phase 5)

- [ ] All Phase 2–5 gates pass
- [ ] Lighthouse scores ≥ baseline on mobile and desktop
- [ ] All nav links resolve correctly on deployed URL
- [ ] Contact form submits successfully to Formspree
- [ ] Blog feed loads (or shows correct fallback)
- [ ] Theme toggle works in both modes on deployed URL
- [ ] Chat widget opens, sends, receives in deployed environment
- [ ] `index.html` removed from root
- [ ] `css/` and `js/` root folders removed (replaced by `src/`)
