import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const probeUrl = "/MyPortfolio/tests/lifecycle-probe.ts";

type Counts = { triggers: number; tweens: number; canvases: number; splitWords: number; frames: number };

// Tracks pending requestAnimationFrame callbacks so leaked render loops show up as growth.
const trackFrames = () => {
  const pending = new Map<number, FrameRequestCallback>();
  const requested = new Map<string, number>();
  const request = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    requested.set(callback.name, (requested.get(callback.name) ?? 0) + 1);
    const id = request((time) => {
      pending.delete(id);
      callback(time);
    });
    pending.set(id, callback);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    pending.delete(id);
    cancel(id);
  };
  (window as unknown as { pendingFrames: () => number }).pendingFrames = () => pending.size;
  (window as unknown as { pendingFrameNames: () => string[] }).pendingFrameNames =
    () => [...pending.values()].map((callback) => callback.name);
  (window as unknown as { frameRequests: () => Record<string, number> }).frameRequests =
    () => Object.fromEntries(requested);
};

const failShaderLinks = () => {
  for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    const getProgramParameter = prototype.getProgramParameter;
    prototype.getProgramParameter = function (program, pname) {
      return pname === this.LINK_STATUS ? false : getProgramParameter.call(this, program, pname);
    };
  }
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
  const paragraphs = page.locator(".about-me .para");
  await expect(paragraphs).toHaveCount(1);
  for (const paragraph of await paragraphs.all()) {
    await expect(paragraph).toHaveCSS("opacity", "1");
    await expect(paragraph).not.toHaveAttribute("style", /translate/);
  }
});

test("reverting a text split cancels its pending line-wrapping frame", async ({ page }) => {
  await openPortfolio(page);
  const nestedLines = await page.evaluate(async (url) =>
    (await import(url)).nestedLinesAfterRebuild(), probeUrl);
  expect(nestedLines).toBe(0);
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

test("invalid encrypted model data releases the loader and shows the portrait", async ({ page }) => {
  await page.route("**/models/character.enc", (route) =>
    route.fulfill({ status: 200, contentType: "application/octet-stream", body: "invalid model data" })
  );
  await openPortfolio(page);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
});

test("shader-link failures release the loader and show the desktop portrait", async ({ page }) => {
  await page.addInitScript(failShaderLinks);
  await openPortfolio(page);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
});

test("shader-link failures keep the mobile portrait and page usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(failShaderLinks);
  await openPortfolio(page);
  await expect(page.locator(".mobile-character")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".mobile-character-portrait")).toBeVisible();
});

test("a failed desktop scene chunk releases the loader and shows the portrait", async ({ page }) => {
  await page.route(/\/src\/components\/Character\/index\.tsx(?:\?.*)?$/, (route) => route.abort());
  await openPortfolio(page);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
  await expect(page.locator(".landing-intro h1")).toBeVisible();
});

test("a failed mobile scene chunk leaves the portrait and page usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(/\/src\/components\/Character\/MobileCharacter\.tsx(?:\?.*)?$/, (route) => route.abort());
  await openPortfolio(page);
  await expect(page.locator(".mobile-character")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".mobile-character-portrait")).toBeVisible();
  await expect(page.locator(".landing-intro h1")).toBeVisible();
});

test("a failed intro chunk still releases the loader and enables scrolling", async ({ page }) => {
  await page.route(/\/src\/components\/utils\/initialFX\.ts(?:\?.*)?$/, (route) => route.abort());
  await page.goto("./");
  await expect(page.locator(".loading-screen")).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator("main.main-active")).toHaveCount(1);
  await expect(page.locator(".landing-intro h1")).toBeVisible();
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
});

test("a failed mobile intro chunk still enables scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.route(/\/src\/components\/utils\/initialFX\.ts(?:\?.*)?$/, (route) => route.abort());
  await openPortfolio(page);
  await expect(page.locator("main.main-active")).toHaveCount(1);
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

test("failed shader compilation disposes the model and shows the portrait", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "requestIdleCallback", { value: undefined });
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      const context = (original as (...a: unknown[]) => unknown).call(this, type, ...args);
      if (type.startsWith("webgl") && context) {
        (context as WebGLRenderingContext).shaderSource = () => {
          throw new Error("Synthetic shader compilation failure");
        };
      }
      return context;
    } as typeof original;
  });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.evaluate(async (url) => (await import(url)).watchModelDisposals(), probeUrl);
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("lenis") &&
    !document.documentElement.classList.contains("lenis-stopped")
  );
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
  const disposed = await page.evaluate(async (url) => (await import(url)).readModelDisposals(), probeUrl);
  expect(disposed.geometries).toBeGreaterThan(0);
  expect(disposed.materials).toBeGreaterThan(0);
});

test("leaving desktop while the model request is pending aborts that request", async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as { modelRequestAborted: boolean[] };
    state.modelRequestAborted = [];
    const original = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/models/character.enc")) {
        const index = state.modelRequestAborted.push(false) - 1;
        init?.signal?.addEventListener("abort", () => { state.modelRequestAborted[index] = true; });
      }
      return original(input, init);
    };
  });
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let captured = false;
  await page.route("**/models/character.enc", async (route) => {
    if (!captured) {
      captured = true;
      await gate;
    }
    await route.continue().catch(() => undefined);
  });
  try {
    await page.goto("./", { waitUntil: "domcontentloaded" });
    await expect.poll(() => captured).toBe(true);
    await page.setViewportSize({ width: 900, height: 900 });
    await expect(page.locator(".character-model")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      (window as unknown as { modelRequestAborted: boolean[] }).modelRequestAborted[0]
    )).toBe(true);
  } finally {
    release();
  }
});

test("unmounting during shader compilation stops polling and disposes the model", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "requestIdleCallback", { value: undefined });
    const state = window as unknown as { allowCompile: boolean; compileChecks: number };
    state.allowCompile = false;
    state.compileChecks = 0;
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const getExtension = prototype.getExtension;
      const getProgramParameter = prototype.getProgramParameter;
      prototype.getExtension = function (this: WebGLRenderingContext | WebGL2RenderingContext, name: string) {
        if (name === "KHR_parallel_shader_compile") {
          return { COMPLETION_STATUS_KHR: 0x91b1 } as KHR_parallel_shader_compile;
        }
        return Reflect.apply(getExtension, this, [name]);
      } as typeof prototype.getExtension;
      prototype.getProgramParameter = function (program, name) {
        if (name === 0x91b1) {
          state.compileChecks++;
          return state.allowCompile;
        }
        return getProgramParameter.call(this, program, name);
      };
    }
  });
  await page.goto("/MyPortfolio/tests/strict-harness.html");
  await page.waitForFunction(() => document.documentElement.dataset.harness === "ready");
  await page.evaluate(async (url) => (await import(url)).watchModelDisposals(), probeUrl);
  await page.evaluate(() => (window as unknown as { harness: { mount: () => Promise<void> } }).harness.mount());
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { compileChecks: number }).compileChecks
  ), { timeout: 30000 }).toBeGreaterThan(0);
  await page.evaluate(() => (window as unknown as { harness: { unmount: () => void } }).harness.unmount());
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect.poll(() => page.evaluate(async (url) =>
    (await import(url)).readModelDisposals().geometries, probeUrl
  )).toBeGreaterThan(0);
  const checks = await page.evaluate(() => (window as unknown as { compileChecks: number }).compileChecks);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => (window as unknown as { compileChecks: number }).compileChecks)).toBe(checks);
  expect(errors).toEqual([]);
});

test("desktop context loss shows the portrait and restores the scene", async ({ page }) => {
  await openPortfolio(page);
  const model = page.locator(".character-model");
  await expect(model).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  await model.locator("canvas").evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    const extension = gl?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("WEBGL_lose_context is unavailable in this browser");
    (window as unknown as { loseContext: WEBGL_lose_context }).loseContext = extension;
    extension.loseContext();
  });
  await expect(model).toHaveAttribute("data-graphics", "fallback");
  await expect(page.locator(".character-fallback")).toBeVisible();
  await expect(page.locator(".loading-screen")).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { loseContext: WEBGL_lose_context }).loseContext.restoreContext());
  await expect(model).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  await expect(model.locator("canvas")).toBeVisible();
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
  const paragraphs = page.locator(".about-me .para");
  await expect(paragraphs).toHaveCount(1);
  for (const paragraph of await paragraphs.all()) {
    await expect(paragraph).toHaveCSS("opacity", "1");
  }
  await page.locator(".techstack-video").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(await page.locator(".techstack-video").evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);
});

test("reduced motion preserves the single-line hero name where it fits", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openPortfolio(page);
    const lineDifference = await page.locator(".landing-intro h1").evaluate((heading) => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const words: Text[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (node.textContent?.trim()) words.push(node);
      }
      const first = document.createRange();
      const last = document.createRange();
      first.selectNodeContents(words[0]);
      last.selectNodeContents(words[words.length - 1]);
      return Math.abs(first.getBoundingClientRect().top - last.getBoundingClientRect().top);
    });
    expect(lineDifference, `${viewport.width}px viewport`).toBeLessThan(2);
  }
});

test("reduced motion leaves contact text visible without a reveal animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);
  await expect(page.locator(".contact-section h3")).toHaveCSS("opacity", "1");
  await expect(page.locator(".contact-box").first()).toHaveCSS("opacity", "1");
});

test("reduced motion keeps the social icons stationary under the pointer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);
  const icon = page.locator("#social span").first();
  const link = icon.locator("a");
  const center = await link.evaluate((element) => element.style.getPropertyValue("--siLeft"));
  const rect = await icon.boundingBox();
  if (!rect) throw new Error("Social icon is not visible");
  await page.mouse.move(rect.x + 35, rect.y + 20);
  await page.waitForTimeout(150);
  expect(await link.evaluate((element) => element.style.getPropertyValue("--siLeft"))).toBe(center);
});

test("hidden social icons do not start pointer animation frames", async ({ page }) => {
  await page.addInitScript(trackFrames);
  await openPortfolio(page);
  const rect = await page.locator("#social span").first().boundingBox();
  if (!rect) throw new Error("Social icon is not visible");
  await page.locator('.header a[data-href="#work"]').click();
  await expect(page.locator(".icons-section")).not.toHaveClass(/is-hero-visible/);
  await page.waitForTimeout(300);
  const count = () => page.evaluate(() =>
    (window as unknown as { frameRequests: () => Record<string, number> }).frameRequests().updatePosition ?? 0
  );
  const before = await count();
  await page.mouse.move(rect.x + 35, rect.y + 20);
  await page.waitForTimeout(200);
  expect(await count()).toBe(before);
});

test("the reduced-motion scene stops its frame loop while hidden and resumes on return", async ({ page }) => {
  await page.addInitScript(trackFrames);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);
  const model = page.locator(".character-model");
  await expect(model).toHaveAttribute("data-graphics", "ready");
  const frameNames = () => page.evaluate(() =>
    (window as unknown as { pendingFrameNames: () => string[] }).pendingFrameNames()
  );
  await expect.poll(frameNames).toContain("animate");
  await page.locator('.header a[data-href="#work"]').click();
  await expect(model).toHaveCSS("visibility", "hidden");
  await expect.poll(frameNames).not.toContain("animate");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(model).toHaveCSS("visibility", "visible");
  await expect.poll(frameNames).toContain("animate");
});

test("reduced motion stops desktop head tracking and normal motion restores it", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "requestIdleCallback", { value: undefined });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.evaluate(async (url) => (await import(url)).watchCharacterHead(), probeUrl);
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  await expect(page.locator(".loading-screen")).toHaveCount(0, { timeout: 30000 });
  const rotation = () => page.evaluate(async (url) =>
    (await import(url)).characterHeadRotation() as [number, number] | null, probeUrl);
  await expect.poll(rotation).not.toBeNull();
  const before = (await rotation())!;
  await page.mouse.move(1300, 100);
  await page.waitForTimeout(800);
  const after = (await rotation())!;
  expect(Math.abs(after[0] - before[0]) + Math.abs(after[1] - before[1])).toBeLessThan(0.001);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(100, 800);
  await expect.poll(async () => {
    const current = (await rotation())!;
    return Math.abs(current[0] - after[0]) + Math.abs(current[1] - after[1]);
  }).toBeGreaterThan(0.02);
});

test("the pause control also stops and resumes mobile character blinking", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("portfolio-motion-paused", "1");
    Math.random = () => 0;
    const state = window as unknown as { webglDraws: number };
    state.webglDraws = 0;
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const draw = prototype.drawElements;
      prototype.drawElements = function (...args) {
        state.webglDraws++;
        return draw.apply(this, args);
      };
    }
  });
  await openPortfolio(page);
  await expect(page.locator(".mobile-character")).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  await page.waitForTimeout(300);
  const draws = () => page.evaluate(() => (window as unknown as { webglDraws: number }).webglDraws);
  const before = await draws();
  expect(before).toBeGreaterThan(0);
  await page.waitForTimeout(4300);
  expect(await draws()).toBe(before);
  await page.getByRole("button", { name: "Play animations" }).click();
  await expect.poll(draws, { timeout: 6000 }).toBeGreaterThan(before);
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
  await expect(page.locator("#about")).toBeFocused({ timeout: 5000 });
});

test("direct section entry lands on the section after the scene initializes", async ({ page }) => {
  await openPortfolio(page, "./#work");
  await expect.poll(() => page.evaluate(() =>
    Math.abs(document.getElementById("work")!.getBoundingClientRect().top)
  ), { timeout: 10000 }).toBeLessThanOrEqual(105);
});

test("direct section entry remains aligned when fonts finish after initialization", async ({ page }) => {
  await page.addInitScript(() => {
    let finishFonts: () => void = () => {};
    const ready = new Promise<void>((resolve) => { finishFonts = resolve; });
    (window as unknown as { finishFonts: () => void }).finishFonts = finishFonts;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { status: "loading", ready },
    });
  });
  await openPortfolio(page, "./#work");
  const top = () => page.evaluate(() => document.getElementById("work")!.getBoundingClientRect().top);
  await expect.poll(async () => Math.abs(await top()), { timeout: 10000 }).toBeLessThanOrEqual(105);
  await page.evaluate(() => {
    document.body.style.overflowAnchor = "none";
    (document.querySelector(".career-section") as HTMLElement).style.marginBottom = "600px";
  });
  await expect.poll(top).toBeGreaterThan(150);
  await page.evaluate(() => (window as unknown as { finishFonts: () => void }).finishFonts());
  await expect.poll(async () => Math.abs(await top()), { timeout: 5000 }).toBeLessThanOrEqual(105);
});

test("late fonts do not pull a user back after they scroll from a direct section", async ({ page }) => {
  await page.addInitScript(() => {
    let finishFonts: () => void = () => {};
    const ready = new Promise<void>((resolve) => { finishFonts = resolve; });
    (window as unknown as { finishFonts: () => void }).finishFonts = finishFonts;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { status: "loading", ready },
    });
  });
  await openPortfolio(page, "./#work");
  await expect.poll(() => page.evaluate(() =>
    Math.abs(document.getElementById("work")!.getBoundingClientRect().top)
  ), { timeout: 10000 }).toBeLessThanOrEqual(105);
  const initialY = await page.evaluate(() => scrollY);
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialY + 150);
  await page.waitForTimeout(2000);
  const scrolledY = await page.evaluate(() => scrollY);
  await page.evaluate(() => (window as unknown as { finishFonts: () => void }).finishFonts());
  await page.waitForTimeout(500);
  expect(Math.abs((await page.evaluate(() => scrollY)) - scrolledY)).toBeLessThan(10);
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
