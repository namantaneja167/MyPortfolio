# Portfolio cleanup: less template, less AI residue

## Goal

Make the portfolio read as deliberately authored, both on the site and in the repository, without changing its look, motion or behaviour.

"AI sloppy" was not defined by the owner. This spec treats it as three visible symptoms:

1. **Copy that hedges or sounds generated**: disclaimers in visible text, template phrasing and generic calls to action.
2. **Repository residue**: dead files, unused CSS, typo'd files, a template package name and lint errors left in place.
3. **Docs written as one long paragraph**: the README explains internals in dense prose instead of telling a reader what the project is and how to run it.

## Non-goals

- No visual redesign. Colours, layout, the character, choreography and breakpoints stay exactly as they are.
- No behaviour changes to scrolling, loading, fallbacks, reduced motion or Windows fixes.
- No dependency upgrades or framework changes.
- Agent tooling the owner installed stays: `.agents/`, `.claude/`, `.kiro/`, `.mcp.json`, `AGENTS.md`/`CLAUDE.md`/`GEMINI.md`, `.cursorrules`, `.windsurfrules` and `.opencode.json`.

## Evidence (at f58bb52)

| Area | Finding |
| --- | --- |
| Dead code | `src/utils/textSplitter.ts` (164 lines) has no importers; it is also the source of 2 lint errors. |
| Dead CSS | Unused selectors: `what-border1/2`, `what-corner`, `what-content-active`, `what-noTouch`, `what-sibling`, `character-loaded`, `landing-image`, `landing-video`, `mobile-photo`, `loading-icon`, `check-line`, `techstack-row`, `see-all-works`, `work-box-cta` and `container1`. Each needs to be confirmed against `tests/` and `index.html` before it is removed. |
| CSS force | `Landing.css` has 45 `!important` declarations, mostly in one reduced-motion/mobile override block. |
| Lint | 7 errors: `any` in `GsapScroll.ts` and `lighting.ts`; `Function` and `prefer-const` in the dead `textSplitter.ts`. There are also 3 react-refresh warnings. |
| Naming | `package.json` name is `moncy-portfolio` (the template author's). The component is called `TechStackNew`. Timelines are called `tl1`–`tl4`. |
| Repo files | `.gitgnore` is an empty, typo'd duplicate of `.gitignore`. `copy-skills.ps1` copies skills from another project's absolute layout. `api/` and `docs/` were empty before this spec. |
| Copy | The character's alt text reads "Stylised character from the portfolio template". Project alts end in "not a production screenshot". The Applied-AI card says "…not production employment systems." The CTA is "Hire Me →" and links to LinkedIn. |
| README | It has a title and run/build steps, then four paragraphs of internal detail. |

## Approaches considered

**A. Repo hygiene only.** Delete dead code and files, fix lint and rename identifiers. This is safest but leaves the visible copy, which is what visitors judge.

**B. Hygiene plus copy and docs (recommended).** Approach A, plus rewrite hedged copy and alt text, plus restructure the README. Visitors and code readers both notice the difference. Pixels and motion do not change.

**C. Deeper restructure.** Split `GsapScroll.ts`, consolidate per-section CSS into tokens and rework components. This has the highest risk to the hard-won scroll and Windows fixes, for little visible gain.

Chosen: **B**.

## Design

### 1. Dead code and files
- Delete `src/utils/textSplitter.ts`, `.gitgnore` and `copy-skills.ps1`. Remove the empty `api/` directory.
- Remove CSS rules whose selectors appear nowhere in `src/`, `tests/` or `index.html`. Remove one class at a time and run a build after each file.

### 2. Types and lint
- Replace the `any` in `GsapScroll.ts` and `lighting.ts` with the actual three.js types (`Object3D`, `Mesh`, `MeshStandardMaterial`, `PointLight`). Use narrowing where materials are arrays.
- Fix or justify the react-refresh warnings, for example by moving the hook export out of `LoadingProvider.tsx`.
- Target: `npm run lint` exits 0.

### 3. Naming
- Rename the `package.json` `name` to `naman-taneja-portfolio`.
- Rename `TechStackNew` to `TechStack`, including its file, CSS file and imports.
- Give `tl1`–`tl4` intent names (`introTimeline`, `aboutTimeline`, `whatIDoTimeline`, `careerExitTimeline` or similar). Names must match each timeline's verified trigger. Keep the existing explanatory comment about the x/xPercent handoff.

### 4. Copy (facts unchanged)
- The character alt becomes something like "3D illustrated character". Decorative duplicates get `alt=""`.
- Project alts describe the graphic plainly ("Data-flow diagram of the Endur migration"). The fact that the graphics are illustrative moves to a single small caption, not every alt.
- The Applied-AI card says what the owner does ("Personal projects exploring RAG and agentic workflows") without a negative disclaimer.
- The CTA label matches its destination: "Connect on LinkedIn →". The resume link is unchanged.
- The footer keeps the MIT attribution, which the license requires, in one plain line.
- Dates, metrics, employers and titles must not change.

### 5. README
Structure: a one-line description, a live link, the stack, run/build/test commands, a short "How it works" bullet list (5–7 bullets distilled from today's prose), credits and licence.

## Safety net

- After every task, run `npm run build` and `npx playwright test --project=chromium`. All 46 tests must stay green.
- Tests that select removed or renamed classes are updated in the same commit, not loosened.
- Compare screenshots before and after (desktop 1440, laptop 1280, mobile 390) for Home, About, What I Do, Work and Contact. The only differences expected are text changes.
- Commit at least once per task. Do not push or deploy without the owner's instruction.

## Open questions for the owner

- Should the CTA go to LinkedIn (current) or open email?
- Should the agent tool config files (`.cursorrules`, `.windsurfrules`, `.kiro/`, `.opencode.json`, `GEMINI.md`) stay tracked in the public repo? This spec keeps them.
