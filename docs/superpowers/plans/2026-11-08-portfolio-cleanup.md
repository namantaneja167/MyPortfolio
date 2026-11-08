# Portfolio Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in one session, then run one superpowers:requesting-code-review pass over the full diff. Steps use checkbox (`- [ ]`) syntax for tracking. Rationale is in the spec's Decisions section.

**Goal:** Remove template and AI residue from the copy, the code and the docs, while keeping pixels, motion and behaviour identical.

**Architecture:** This is a refactor and a copy pass. Nothing new is built. Each task ends with a green build, a clean lint for the files it touched, and the existing Playwright suite still passing.

**Tech Stack:** React 18, TypeScript, Vite 5, three.js 0.168, GSAP/ScrollTrigger, Lenis, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-08-portfolio-cleanup-design.md`

## Global Constraints

- No change to colours, layout, character, choreography, breakpoints, scroll, loading, fallbacks, reduced motion or Windows fixes.
- No dependency changes.
- Facts stay exact: the dates, metrics, employers and titles in `src/config.ts`.
- Agent tooling files stay tracked: `.agents/`, `.claude/`, `.kiro/`, `.mcp.json`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.opencode.json`.
- Gate after every task:
  - `npm run build` passes.
  - `npx playwright test --project=chromium` shows all tests passing (46 at baseline `f58bb52`).
- Commits use the trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`.
- No push and no deploy.

## Review Focus

1. **Renamed CSS classes.** A selector that is still used by a test, by `index.html` or by a `querySelector` string inside a `.ts` file must not be removed. Before each deletion, grep `src tests index.html` for the bare class name.
2. **Timeline renames in `GsapScroll.ts`.** The arrays at lines 131 and 225 must keep the same order, because the order drives refresh and progress sync. The test "character moves continuously from About into What I Do" must stay green.
3. **Moving `setProgress` and `useLoading` out of component files.** `Scene.tsx` must keep the same progress cadence. The lifecycle tests for blocked models and loader release cover this.
4. **Lenis import path.** `WhatIDo.tsx` currently imports `lenis` through `Navbar`. Re-pointing it at `utils/pageLifecycle` must keep the live binding, not a stale copy.
5. **Copy changes on narrow screens.** "Connect on LinkedIn →" is longer than "Hire Me →", so the button must not wrap at a 390 px viewport. Task 4 adds a check for this.

---

### Task 1: Delete dead files and dead CSS

**Files:**
- Delete: `src/utils/textSplitter.ts`, `.gitgnore`, `copy-skills.ps1` and the empty `api/` directory
- Modify:
  - `src/components/styles/WhatIDo.css`
  - `src/components/styles/Landing.css`
  - `src/components/styles/Loading.css`
  - `src/components/styles/SocialIcons.css`
  - `src/components/styles/TechStackNew.css`
  - `src/components/styles/Work.css`
  - `src/index.css`

- [ ] **Step 1: Confirm each candidate is unreferenced.** For each class below, `grep -rn "<class>" src tests index.html` must return only CSS hits:
  - `what-border1`, `what-border2`, `what-corner`, `what-content-active`, `what-noTouch`, `what-sibling`
  - `character-loaded`, `landing-image`, `landing-video`, `mobile-photo`
  - `loading-icon`, `check-line`, `techstack-row`, `see-all-works`, `work-box-cta`, `container1`

  Drop any class that has another hit from this task.
- [ ] **Step 2: Remove the rule blocks for the confirmed classes.** A rule with a compound selector loses only the dead part. Remove any `@media` blocks left empty.
- [ ] **Step 3: Delete the dead files.**
- [ ] **Step 4: Run the gate.** Expected: build OK and all tests pass. Lint no longer reports `textSplitter.ts`.
- [ ] **Step 5: Commit** with the message `chore: remove dead code, CSS and stray files`.

### Task 2: Type the scene code and clear lint

**Files:**
- Modify:
  - `src/components/utils/GsapScroll.ts:98-101`
  - `src/components/Character/utils/lighting.ts:44`
  - `src/components/Loading.tsx:122` (move `setProgress` out)
  - `src/components/Navbar.tsx:18` (drop the `lenis` re-export)
  - `src/context/LoadingProvider.tsx:81` (move `useLoading` out)
  - `src/components/WhatIDo.tsx:4`
  - `src/components/Character/Scene.tsx:5,15`
  - `src/components/MainContainer.tsx:14`
  - `src/App.tsx:3`
- Create: `src/utils/loadingProgress.ts`, `src/context/useLoading.ts`

**Interfaces:**
- Produces:
  - `export const setProgress(setLoading: (value: number) => void)` in `src/utils/loadingProgress.ts`. The signature and return value are unchanged.
  - `export const useLoading()` in `src/context/useLoading.ts`. `LoadingProvider.tsx` must export `LoadingContext` so this hook can read it.

- [ ] **Step 1:** Run `npx eslint .` and record the output. Expected: 5 errors (the two `textSplitter` errors were removed in Task 1) and 3 warnings.
- [ ] **Step 2:** In `GsapScroll.ts`, replace `any` with `THREE.Object3D` and `THREE.Mesh` for the traverse callback. Use `THREE.MeshStandardMaterial` for the screen material, and narrow with `Array.isArray(mesh.material)` before using it. In `lighting.ts`, use the concrete light or material type at line 44.
- [ ] **Step 3:** Move `setProgress` and `useLoading` into the new files. Update every importer listed above. Point `WhatIDo.tsx` at `import { lenis } from "../utils/pageLifecycle"`. Remove `export { lenis }` from `Navbar.tsx`.
- [ ] **Step 4:** Run `npm run lint`. Expected: exit 0, with 0 errors and 0 warnings.
- [ ] **Step 5: Run the gate.**
- [ ] **Step 6: Commit** with the message `refactor: type scene helpers and split non-component exports`.

### Task 3: Rename the template identifiers

**Files:**
- Rename:
  - `src/components/TechStackNew.tsx` → `src/components/TechStack.tsx`
  - `src/components/styles/TechStackNew.css` → `src/components/styles/TechStack.css`
- Modify:
  - `src/components/MainContainer.tsx`
  - `src/components/utils/GsapScroll.ts`
  - `package.json` (`name`)
  - `package-lock.json` (`name`, via `npm install --package-lock-only`)

- [ ] **Step 1:** Use `git mv` for both files, then update the component name and imports. The CSS class names (`techstack-*`) do not change.
- [ ] **Step 2:** In `GsapScroll.ts`, apply these renames:
  - `tl1` → `landingTimeline` (trigger `.landing-section`)
  - `tl2` → `aboutTimeline` (`.about-section`)
  - `tl3` → `whatIDoTimeline` (`.whatIDO`)
  - `tl4` → `careerTimeline` (`.career-section`)
  - `tM2` → `whatIDoCardsTimeline`

  Update the comments that say "tl2"/"tl3" to use the new names. Keep the array order unchanged.
- [ ] **Step 3:** Set `package.json` `"name": "naman-taneja-portfolio"`, then run `npm install --package-lock-only`.
- [ ] **Step 4:** Run `grep -rn "TechStackNew\|\btl[1-4]\b\|tM2\|moncy" src package.json`. Expected: no output.
- [ ] **Step 5: Run the gate.**
- [ ] **Step 6: Commit** with the message `refactor: rename template identifiers`.

### Task 4: Rewrite hedged copy and alt text

**Files:**
- Modify:
  - `src/config.ts`: project `alt` values, and `skills.design.details`
  - `src/components/MainContainer.tsx`: the mobile portrait `alt`
  - `src/components/Character/CharacterPortrait.tsx`: the portrait `alt`
  - `src/components/CallToAction.tsx`: the label
  - `src/components/Contact.tsx`: the footer credit
  - `src/components/Work.tsx`: one caption under the project list
- Test: `tests/lifecycle.spec.ts`

**Exact copy:**
- Character alt: `"3D illustrated character"`. Decorative duplicates shown beside a live canvas get `alt=""` and `aria-hidden`.
- Project alts:
  - `"Data-flow diagram of the Endur migration"`
  - `"Data-flow diagram of market-data ingestion"`
  - `"Analytics pipeline diagram for pharma reporting"`
  - `"Workflow diagram of the Tableau automation framework"`
- Work caption: `"Diagrams are illustrative; client systems are confidential."`
- `skills.design.details`: `"Personal projects exploring retrieval-augmented generation and agentic workflows."`
- CTA: `Connect on LinkedIn →`
- Footer: `Designed and built by {fullName}. Based on Redoyanul Haque's MIT-licensed portfolio.`

- [ ] **Step 1: Write a failing test.** Add the test `copy has no template disclaimers` to `tests/lifecycle.spec.ts`. It loads the page and asserts:
  - `page.locator('img[alt*="template"], img[alt*="not a"]')` has count 0.
  - `.cta-btn-hire` has the text `Connect on LinkedIn →`.
  - At viewport 390×844, `.cta-btn-hire`'s `getBoundingClientRect().height` is under 2 × its computed line-height (no wrap).
- [ ] **Step 2:** Run `npx playwright test --project=chromium -g "template disclaimers"`. Expected: FAIL.
- [ ] **Step 3:** Apply the exact copy above.
- [ ] **Step 4:** Rerun the test. Expected: PASS. Then run the full gate.
- [ ] **Step 5: Compare screenshots before and after.** Use 1440×900, 1280×800 and 390×844, covering Home, About, What I Do, Work and Contact. The only differences should be in the changed text. Save the captures to the session files folder, not the repo.
- [ ] **Step 6: Commit** with the message `content: replace hedged copy and template alt text`.

### Task 5: Restructure the README

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Rewrite the README with these sections, in this order:
  1. Title
  2. A one-line description
  3. A live link: https://namantaneja167.github.io/MyPortfolio/
  4. **Stack**
  5. **Run** (`npm ci`, `npm run dev`)
  6. **Build** (mention the `/MyPortfolio/` base path)
  7. **Test** (`npx playwright install chromium`, `npm run build`, `npm run test:scroll -- --project=chromium`)
  8. **How it works**: 5–7 bullets distilled from the current prose — Lenis on the GSAP ticker, scrubbed desktop timelines, render pausing, graphics fallbacks, reduced motion and the pause control, the mobile portrait, and the test coverage
  9. **Credits & licence**
- [ ] **Step 2:** Check that every command in the README runs as written.
- [ ] **Step 3: Commit** with the message `docs: restructure README`.

---

## Self-review

- **Spec coverage:** spec section 1 → Task 1, 2 → Task 2, 3 → Task 3, 4 → Task 4, 5 → Task 5. The safety net is the gate plus Task 4 Step 5.
- **Names:** `setProgress` and `useLoading` keep their names and only move file. The timeline names are used only inside `GsapScroll.ts`.
- **Left open on purpose:** the `!important` block in `Landing.css` is reported in the spec but not changed. Untangling it risks the mobile and reduced-motion layout, which the non-goals forbid.
