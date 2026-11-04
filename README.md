# Naman Taneja — Portfolio

Personalized data-engineering portfolio built on the React, TypeScript, Three.js, and GSAP template by [Redoyanul Haque](https://github.com/red1-for-hek/portfolio-website).

## Run locally

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

The Vite build uses `/MyPortfolio/` for the GitHub Pages project-site base path. The deployment workflow publishes the generated `dist/` directory.

Capability cards start collapsed and expand using native disclosure controls. Desktop reserves space for an expanded card, while smaller layouts refresh scroll measurements when their height changes. Career reveals are independent of the 3D model; reduced motion keeps the career content static and the character within the hero.

The horizontal project sequence measures its last card on each scroll refresh, including after styles and fonts settle. Mobile and reduced-motion layouts use an unpinned vertical list.

Lenis runs on the GSAP ticker and updates ScrollTrigger on each scroll step. Native CSS smooth scrolling is overridden while Lenis owns scrolling; its duration and wheel multiplier remain 1.7. Full-width sections exclude the scrollbar gutter. The desktop character caps its render pixel ratio at 1.5 and reapplies it on resize, limiting GPU work on scaled displays; antialiasing stays on because that cap is below a 2x display's ratio.

The desktop scene pauses rendering while offscreen or in a hidden tab and resumes with a clamped frame delta. If WebGL, shader linking, the model, or the scene code fails, or the context is lost, the loader is released and a static portrait is shown in the hero. Leaving the desktop breakpoint cancels pending character loading and disposes the scene, its timelines and its listeners. If the intro code cannot load, the page still becomes readable and scrollable.

Reduced motion shows final poses and plain text, without pointer-driven head movement. The header pause button stops persistent decorative motion (character idle animation and head tracking, mobile blinking, screen flicker, background video, glow and timeline loops) and is remembered for later visits; it is hidden when the OS already requests reduced motion. Desktop section links scroll smoothly while updating the URL hash, browser history and keyboard focus. Direct section links are realigned after fonts finish loading unless the visitor has already interacted.

Mobile and tablet heroes show the same template character in a low-power 3D portrait with a gentle smile and occasional blink. It renders only on load, resize, or while blinking; motion pauses offscreen, in hidden tabs, and when reduced motion or the pause control is enabled. A matching portrait remains visible while loading or if WebGL or the mobile scene code is unavailable; mobile content never waits for graphics.

## Scroll and lifecycle checks

```bash
npx playwright install chromium
npm run build
npm run test:scroll
```

The checks start Vite automatically and exercise wheel/trackpad input, same-frame scrub progress, classic scrollbar gutters, project navigation, reduced-motion work layout, and desktop DPR changes. Lifecycle checks cover stable ScrollTrigger refreshes, blocked models, failed WebGL and shader linking, resizing before the deferred scene mounts, repeated breakpoint crossings, reduced motion and the pause button, navigation hash/focus, and late-font restoration. Production checks start a temporary preview server and load the built page and its assets under `/MyPortfolio/`; they are skipped without a build. A Strict Mode harness (`tests/strict-harness.html`, dev server only) mounts and unmounts the whole app repeatedly and checks that app listeners, refresh handlers, ScrollTriggers, animations, canvases and frame loops return to the same counts each cycle. They run in Chromium and installed Microsoft Edge; use `npm run test:scroll -- --project=chromium` when Edge is unavailable.

## Attribution and license

The visual system and character presentation are adapted from Redoyanul Haque’s [MIT-licensed portfolio template](https://github.com/red1-for-hek/portfolio-website). The upstream license is retained in [LICENSE](LICENSE).
