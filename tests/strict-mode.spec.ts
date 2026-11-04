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
    // Only GSAP ScrollTrigger's own scheduler frames may remain, and they must not grow.
    expect(unmounted.frames).toBeLessThanOrEqual(firstUnmount.frames);
    expect(unmounted.frames).toBeLessThanOrEqual(2);
    expect(unmounted.tweens).toBeLessThanOrEqual(1);

    const mounted = await mountAndWait(page);
    test.info().annotations.push({ type: `remount ${cycle}`, description: JSON.stringify(mounted) });
    expect(mounted.appListeners, JSON.stringify(mounted.byOwner)).toBe(first.appListeners);
    expect(mounted.globalListeners, JSON.stringify(mounted.byOwner)).toBe(first.globalListeners);
    expect(mounted.refreshListeners).toBe(first.refreshListeners);
    expect(mounted.triggers).toBe(first.triggers);
    expect(mounted.canvases).toBe(1);
    expect(mounted.frames).toBeLessThanOrEqual(first.frames);
    expect(mounted.tweens).toBeLessThanOrEqual(first.tweens + 2);
  }
});
