import { expect, test, type Page } from "@playwright/test";

type Counts = {
  globalListeners: number;
  appListeners: number;
  byOwner: Record<string, number>;
  refreshListeners: number;
  removedDuringMount: number;
  triggers: number;
  tweens: number;
  canvases: number;
  frames: number;
  frameNames: string[];
};

const counts = (page: Page) =>
  page.evaluate(() => (window as unknown as { harness: { counts: () => Counts } }).harness.counts());

const settle = (page: Page) =>
  page.evaluate(() => new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 500)))
  ));

async function mountAndWait(page: Page) {
  await page.evaluate(() => (window as unknown as { harness: { mount: () => Promise<void> } }).harness.mount());
  await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
  await expect(page.locator(".loading-screen")).toHaveCount(0, { timeout: 60000 });
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("lenis") &&
    !document.documentElement.classList.contains("lenis-stopped")
  );
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  return counts(page);
}

async function unmountAndWait(page: Page) {
  await page.evaluate(() => (window as unknown as { harness: { unmount: () => void } }).harness.unmount());
  await expect(page.locator("canvas")).toHaveCount(0);
  // The last mount's one-shot intro tweens may still be finishing; leaked loops never would.
  // ScrollTrigger keeps one paused resize-debounce call for the page's lifetime; everything else must finish.
  const appAnimations = async () => {
    const leftovers = await page.evaluate(() =>
      (window as unknown as { harness: { leftovers: () => { animations: string[] } } }).harness.leftovers());
    return { leftovers, app: leftovers.animations.filter((name) => !name.startsWith("function _refreshAll")) };
  };
  const deadline = Date.now() + 15000;
  let remaining = await appAnimations();
  while (remaining.app.length && Date.now() < deadline) {
    await page.waitForTimeout(250);
    remaining = await appAnimations();
  }
  expect(remaining.app, JSON.stringify(remaining.leftovers)).toEqual([]);
  await settle(page);
  return counts(page);
}

test("refresh listener and trigger counts remain stable across refreshes and resizes", async ({ page }) => {
  await page.goto("/MyPortfolio/tests/strict-harness.html");
  await page.waitForFunction(() => document.documentElement.dataset.harness === "ready");
  const before = await mountAndWait(page);
  for (const width of [1300, 1440, 1360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() =>
      (window as unknown as { harness: { refresh: () => void } }).harness.refresh()
    );
    await settle(page);
  }
  await page.evaluate(() => {
    const { refresh } = (window as unknown as { harness: { refresh: () => void } }).harness;
    for (let i = 0; i < 12; i++) refresh();
  });
  const after = await counts(page);
  expect(after.refreshListeners).toBe(before.refreshListeners);
  expect(after.triggers).toBe(before.triggers);
  const unmounted = await unmountAndWait(page);
  expect(unmounted.refreshListeners).toBe(0);
});

test("Strict Mode mount/cleanup cycles release listeners, triggers, canvases and frames", async ({ page }) => {
  test.setTimeout(360000);
  // The harness uses the dev server, where Strict Mode mounts, cleans up and remounts every effect.
  await page.goto("/MyPortfolio/tests/strict-harness.html");
  await page.waitForFunction(() => document.documentElement.dataset.harness === "ready");
  await settle(page);

  const first = await mountAndWait(page);
  test.info().annotations.push({ type: "first mount", description: JSON.stringify(first) });
  // Strict Mode's simulated cleanup must have run, yet only one scene and one set of handlers survive it.
  expect(first.removedDuringMount).toBeGreaterThan(0);
  expect(first.canvases).toBe(1);
  expect(first.refreshListeners).toBe(2);
  expect(first.appListeners).toBeGreaterThan(0);

  let firstUnmount: Counts | undefined;
  for (let cycle = 1; cycle <= 3; cycle++) {
    const unmounted = await unmountAndWait(page);
    test.info().annotations.push({ type: `unmount ${cycle}`, description: JSON.stringify(unmounted) });
    // GSAP ScrollTrigger and React DOM register their global listeners once per page; app code must remove all of its own.
    expect(unmounted.appListeners, JSON.stringify(unmounted.byOwner)).toBe(0);
    firstUnmount ??= unmounted;
    expect(unmounted.globalListeners, JSON.stringify(unmounted.byOwner)).toBe(firstUnmount.globalListeners);
    expect(unmounted.refreshListeners).toBe(0);
    expect(unmounted.triggers).toBe(0);
    expect(unmounted.canvases).toBe(0);
    // GSAP can queue a one-shot scroll update between snapshots; it must drain,
    // leaving only its ticker and ScrollTrigger's page-level repaint workaround.
    await expect.poll(async () => (await counts(page)).frameNames.filter((name) =>
      !/^_(?:tick|rafBugFix)/.test(name)
    ), { timeout: 3000 }).toEqual([]);
    await expect.poll(async () => (await counts(page)).frames, { timeout: 3000 }).toBeLessThanOrEqual(2);
    expect(unmounted.tweens).toBeLessThanOrEqual(1);

    const mounted = await mountAndWait(page);
    test.info().annotations.push({ type: `remount ${cycle}`, description: JSON.stringify(mounted) });
    expect(mounted.appListeners, JSON.stringify(mounted.byOwner)).toBe(first.appListeners);
    expect(mounted.globalListeners, JSON.stringify(mounted.byOwner)).toBe(first.globalListeners);
    expect(mounted.refreshListeners).toBe(first.refreshListeners);
    expect(mounted.triggers).toBe(first.triggers);
    expect(mounted.canvases).toBe(1);
    await expect.poll(async () => (await counts(page)).frameNames.filter((name) =>
      name === "animate"
    ).length).toBe(1);
    await expect.poll(async () => (await counts(page)).frames, { timeout: 3000 }).toBeLessThanOrEqual(first.frames);
    expect(mounted.tweens).toBeLessThanOrEqual(first.tweens + 2);
  }
});

test("unmounting mobile while its intro chunk loads cancels the delayed intro", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let requested = false;
  await page.route(/\/src\/components\/utils\/initialFX\.ts(?:\?.*)?$/, async (route) => {
    requested = true;
    await gate;
    await route.continue().catch(() => undefined);
  });
  try {
    await page.goto("/MyPortfolio/tests/strict-harness.html");
    await page.waitForFunction(() => document.documentElement.dataset.harness === "ready");
    await page.evaluate(() => (window as unknown as { harness: { mount: () => Promise<void> } }).harness.mount());
    await expect.poll(() => requested).toBe(true);
    await page.evaluate(() => (window as unknown as { harness: { unmount: () => void } }).harness.unmount());
    release();
    await page.waitForTimeout(1200);
    expect(errors).toEqual([]);
    expect(await page.locator("canvas").count()).toBe(0);
  } finally {
    release();
  }
});
