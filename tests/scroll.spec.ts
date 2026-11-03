import { expect, test, type Page } from "@playwright/test";

const probeUrl = "/MyPortfolio/tests/scroll-probe.ts";

async function openPortfolio(page: Page) {
  await page.goto("./");
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("lenis") &&
    !document.documentElement.classList.contains("lenis-stopped")
  );
  await expect(page.locator(".loading-screen")).toHaveCount(0);
}

test("wheel and trackpad scrolling update scrub progress in the same frame", async ({ page }) => {
  await openPortfolio(page);
  await page.evaluate(async (url) => (await import(url)).startProbe(), probeUrl);
  await page.mouse.move(700, 400);

  // Discrete wheel notches followed by a small-delta trackpad burst.
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(100);
  }
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 8);
  }
  await expect.poll(async () =>
    page.evaluate(async (url) => (await import(url)).readProbe().scrolling, probeUrl)
  ).toBe(false);

  const result = await page.evaluate(async (url) => (await import(url)).readProbe(), probeUrl);
  expect(result.samples.length).toBeGreaterThan(5);
  expect(result.y).toBeGreaterThan(100);
  expect(Math.abs(result.y - result.target)).toBeLessThanOrEqual(1);
  for (const sample of result.samples) {
    expect(Math.abs(sample.scroll - sample.progress * 10000)).toBeLessThanOrEqual(1);
  }

  await page.evaluate(async (url) => (await import(url)).stopProbe(), probeUrl);
  await page.mouse.wheel(0, -240);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(result.y - 100);
});

test("Lenis-owned pages do not add native smooth-scroll interpolation", async ({ page }) => {
  await openPortfolio(page);
  const position = await page.evaluate(() => {
    window.scrollTo({ top: 300 });
    return window.scrollY;
  });
  expect(position).toBe(300);
});

test("pinned work fits a classic scrollbar gutter and reveals the final card", async ({ page }) => {
  await openPortfolio(page);
  // Reserve the same gutter as non-overlay Windows scrollbars in headless browsers.
  await page.addStyleTag({ content: "html { scrollbar-gutter: stable; overflow-y: scroll; }" });
  await page.evaluate(() => dispatchEvent(new Event("resize")));
  const widths = await page.evaluate(() => ({
    available: document.documentElement.getBoundingClientRect().width,
    work: document.querySelector(".work-section")!.getBoundingClientRect().width,
  }));
  expect(widths.available).toBeLessThan(1440);
  expect(widths.work).toBeLessThanOrEqual(widths.available + 1);

  await page.locator('.header a[data-href="#work"]').click();
  await expect.poll(() => page.evaluate(() =>
    Math.abs(document.querySelector(".work-section")!.getBoundingClientRect().top)
  )).toBeLessThanOrEqual(105);
  await page.mouse.wheel(0, 3600);
  await expect.poll(() => page.evaluate(() => {
    const section = document.querySelector(".work-section")!.getBoundingClientRect();
    const last = document.querySelector(".work-box:last-child")!.getBoundingClientRect();
    return Math.abs(last.right - section.right);
  }), { timeout: 10000 }).toBeLessThanOrEqual(2);
});

test("reduced motion keeps work unpinned and career content visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".career-timeline")).toHaveCSS("opacity", "1");
});

async function canvasCoverage(page: Page, selector: string) {
  const clip = await page.evaluate((sel) => {
    const rect = document.querySelector(sel)!.getBoundingClientRect();
    const top = Math.max(0, rect.top);
    const bottom = Math.min(innerHeight, rect.bottom);
    if (bottom - top < 8) return null;
    return { x: Math.max(0, rect.left), y: top, width: Math.min(innerWidth, rect.right) - Math.max(0, rect.left), height: bottom - top };
  }, selector);
  if (!clip) return 0;
  const canvas = page.locator(".character-model canvas");
  const shown = (await page.screenshot({ clip })).toString("base64");
  await canvas.evaluate((element) => { (element as HTMLElement).style.visibility = "hidden"; });
  const hidden = (await page.screenshot({ clip })).toString("base64");
  await canvas.evaluate((element) => { (element as HTMLElement).style.visibility = ""; });
  return page.evaluate(async ([a, b]) => {
    const pixels = async (data: string) => {
      const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
      const context = new OffscreenCanvas(image.width, image.height).getContext("2d")!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    };
    const [withCanvas, withoutCanvas] = await Promise.all([pixels(a), pixels(b)]);
    let changed = 0;
    for (let i = 0; i < withCanvas.length; i += 4) {
      const delta = Math.abs(withCanvas[i] - withoutCanvas[i]) +
        Math.abs(withCanvas[i + 1] - withoutCanvas[i + 1]) +
        Math.abs(withCanvas[i + 2] - withoutCanvas[i + 2]);
      if (delta > 60) changed++;
    }
    return changed / (withCanvas.length / 4);
  }, [shown, hidden]);
}

test("character leaves before covering the career heading and first role", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    viewport: { width: 1920, height: 1080 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  try {
    await openPortfolio(page);
    const careerTop = await page.evaluate(() =>
      document.querySelector(".career-section")!.getBoundingClientRect().top + scrollY
    );
    const fractions = [0.7, 0.55, 0.4, 0.25, 0.1, -0.05];
    const sampleAt = async (fraction: number) => {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(careerTop - fraction * 1080));
      await page.evaluate(() => new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      ));
      // Let the 0.45s career row reveal finish so only canvas pixels differ.
      await page.waitForTimeout(600);
      return Math.max(
        await canvasCoverage(page, ".career-section h2"),
        await canvasCoverage(page, ".career-info-box")
      );
    };
    const coverage: number[] = [];
    for (const fraction of fractions) coverage.push(await sampleAt(fraction));
    for (const fraction of [...fractions].reverse()) coverage.push(await sampleAt(fraction));
    expect(Math.max(...coverage)).toBeLessThan(0.005);
  } finally {
    await context.close();
  }
});

test("desktop canvas bounds its pixel budget and follows monitor DPR changes", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  try {
    await openPortfolio(page);
    const pixelRatio = () => page.locator(".character-model canvas").evaluate((canvas) =>
      (canvas as HTMLCanvasElement).width / canvas.getBoundingClientRect().width
    );
    expect(await pixelRatio()).toBeLessThanOrEqual(1.5);
    await page.evaluate(() => {
      Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
      dispatchEvent(new Event("resize"));
    });
    await expect.poll(pixelRatio).toBeCloseTo(1, 2);
  } finally {
    await context.close();
  }
});
