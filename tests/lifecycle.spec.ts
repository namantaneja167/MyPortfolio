import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const probeUrl = "/MyPortfolio/tests/lifecycle-probe.ts";

type Counts = { triggers: number; tweens: number; canvases: number; splitWords: number; frames: number };

// Tracks pending requestAnimationFrame callbacks so leaked render loops show up as growth.
const trackFrames = () => {
  const pending = new Set<number>();
  const request = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    const id = request((time) => {
      pending.delete(id);
      callback(time);
    });
    pending.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    pending.delete(id);
    cancel(id);
  };
  (window as unknown as { pendingFrames: () => number }).pendingFrames = () => pending.size;
};

async function openPortfolio(page: Page, path = "./") {
  await page.goto(path);
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("lenis") &&
    !document.documentElement.classList.contains("lenis-stopped")
  );
  await expect(page.locator(".loading-screen")).toHaveCount(0);
}

async function counts(page: Page): Promise<Counts> {
  return page.evaluate(async (url) => {
    const result = (await import(url)).counts();
    const pending = (window as unknown as { pendingFrames?: () => number }).pendingFrames;
    return { ...result, frames: pending ? pending() : 0 };
  }, probeUrl);
}

const settle = (page: Page) =>
  page.evaluate(() => new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 300)))
  ));

test("ScrollTrigger refreshes do not rebuild text or add triggers", async ({ page }) => {
  await openPortfolio(page);
  await page.evaluate(async (url) => (await import(url)).watchTextRebuilds(), probeUrl);
  const before = await counts(page);
  for (let round = 0; round < 3; round++) {
    await page.evaluate(async (url) => (await import(url)).refreshTimes(4), probeUrl);
  }
  const rebuilds = await page.evaluate(async (url) => (await import(url)).readTextRebuilds(), probeUrl);
  const after = await counts(page);
  expect(rebuilds).toBe(0);
  expect(after.triggers).toBe(before.triggers);
  expect(after.splitWords).toBe(before.splitWords);
});

test("repeated resizes keep one text animation set and narrow screens get plain text", async ({ page }) => {
  await openPortfolio(page);
  const before = await counts(page);
  expect(before.splitWords).toBeGreaterThan(0);
  for (const width of [1300, 1440, 1360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await settle(page);
  }
  const after = await counts(page);
  expect(after.triggers).toBe(before.triggers);
  expect(after.splitWords).toBe(before.splitWords);

  await page.setViewportSize({ width: 800, height: 900 });
  await expect.poll(async () => (await counts(page)).splitWords).toBe(0);
  const para = page.locator(".about-me .para");
  await expect(para).toHaveCSS("opacity", "1");
  await expect(para).not.toHaveAttribute("style", /translate/);
});

test("a blocked character model releases the loader and shows the desktop portrait", async ({ page }) => {
  await page.route("**/models/character.enc", (route) => route.abort());
  await openPortfolio(page);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
  await expect(page.locator(".character-model canvas")).toBeHidden();
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
});

test("failed WebGL initialization falls back without stranding the loader", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
  await openPortfolio(page);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
  await expect(page.locator(".landing-intro h1")).toBeVisible();
});

test("shrinking below 1024px before the deferred scene mounts still releases the loader", async ({ page }) => {
  // Force the 1.2s timeout path so the resize reliably lands before the mount.
  await page.addInitScript(() => {
    Object.defineProperty(window, "requestIdleCallback", { value: undefined });
  });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForFunction(() => !document.documentElement.classList.contains("lenis-stopped"));
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(page.locator("main.main-active")).toHaveCount(1);
  await expect(page.locator(".character-model")).toHaveCount(0);
});

test("crossing the 1024px breakpoint repeatedly does not accumulate scene resources", async ({ page }) => {
  await page.addInitScript(trackFrames);
  await openPortfolio(page);
  const model = page.locator(".character-model");
  await expect(model).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  await settle(page);
  const before = await counts(page);
  expect(before.canvases).toBe(1);

  for (let round = 0; round < 3; round++) {
    await page.setViewportSize({ width: 900, height: 900 });
    await expect(model).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(model).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  }
  await settle(page);
  const after = await counts(page);
  expect(after.canvases).toBe(1);
  expect(after.triggers).toBe(before.triggers);
  expect(after.frames).toBeLessThanOrEqual(before.frames);
  expect(after.tweens).toBeLessThanOrEqual(before.tweens + 2);
});

test("reduced motion stops decorative loops and keeps text readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);
  await expect(page.locator("html")).toHaveClass(/motion-paused/);
  await expect(page.locator(".motion-toggle")).toHaveCount(0);
  await expect(page.locator(".landing-circle1")).toHaveCSS("animation-play-state", "paused");
  expect((await counts(page)).splitWords).toBe(0);
  await expect(page.locator(".about-me .para")).toHaveCSS("opacity", "1");
  await page.locator(".techstack-video").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await page.locator(".techstack-video").evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);
});

test("the pause control stops persistent motion and persists across reloads", async ({ page }) => {
  await openPortfolio(page);
  const toggle = page.getByRole("button", { name: "Pause animations" });
  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/motion-paused/);
  await expect(page.getByRole("button", { name: "Play animations" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".career-dot")).toHaveCSS("animation-play-state", "paused");
  await page.locator(".techstack-video").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await page.locator(".techstack-video").evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);

  await openPortfolio(page);
  await expect(page.getByRole("button", { name: "Play animations" })).toBeVisible();
  await page.getByRole("button", { name: "Play animations" }).click();
  await expect(page.locator("html")).not.toHaveClass(/motion-paused/);
});

test("desktop navigation updates the hash, focus and history", async ({ page }) => {
  await openPortfolio(page);
  await page.locator('.header a[data-href="#about"]').click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator("#about")).toBeFocused({ timeout: 5000 });

  await page.locator('.header a[data-href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#contact")).toBeFocused({ timeout: 5000 });

  await page.goBack();
  await expect(page).toHaveURL(/#about$/);
  await expect.poll(() => page.evaluate(() =>
    Math.abs(document.getElementById("about")!.getBoundingClientRect().top)
  ), { timeout: 5000 }).toBeLessThanOrEqual(105);
});

test("direct section entry lands on the section after the scene initializes", async ({ page }) => {
  await openPortfolio(page, "./#work");
  await expect.poll(() => page.evaluate(() =>
    Math.abs(document.getElementById("work")!.getBoundingClientRect().top)
  ), { timeout: 10000 }).toBeLessThanOrEqual(105);
});

test("production build references assets beneath /MyPortfolio/", () => {
  const dist = join(process.cwd(), "dist");
  test.skip(!existsSync(join(dist, "index.html")), "Run npm run build first");
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1])
    .filter((ref) => !/^(https?:|mailto:|data:|#)/.test(ref));
  expect(refs.length).toBeGreaterThan(0);
  for (const ref of refs) {
    expect(ref).toMatch(/^\/MyPortfolio\//);
    expect(existsSync(join(dist, ref.replace(/^\/MyPortfolio\//, "").split("?")[0]))).toBe(true);
  }
  for (const asset of ["models/character.enc", "models/char_enviorment.hdr", "images/character-mobile.png", "video/video.webm"]) {
    expect(existsSync(join(dist, asset)), asset).toBe(true);
  }
});
