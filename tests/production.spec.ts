import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { preview, type PreviewServer } from "vite";

const dist = join(process.cwd(), "dist");
const assets = join(dist, "assets");

test.describe("production preview", () => {
  test.skip(!existsSync(join(dist, "index.html")), "Run npm run build first");

  let server: PreviewServer;
  let site: string;

  test.beforeAll(async () => {
    server = await preview({
      logLevel: "silent",
      preview: { host: "127.0.0.1", port: 0, strictPort: true },
    });
    const address = server.httpServer.address();
    if (!address || typeof address === "string") throw new Error("Production preview did not bind to a TCP port");
    site = `http://127.0.0.1:${address.port}/MyPortfolio/`;
  });

  test.afterAll(async () => {
    if (!server) return;
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => error ? reject(error) : resolve());
    });
  });

  test("serves real production assets from the GitHub Pages base path", async ({ request }) => {
    const response = await request.get(site);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/text\/html/);
    const html = await response.text();
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((ref) => !/^(https?:|mailto:|data:|#)/.test(ref));
    expect(references.length).toBeGreaterThan(0);

    await Promise.all(references.map(async (ref) => {
      expect(ref).toMatch(/^\/MyPortfolio\//);
      const asset = await request.get(new URL(ref, site).href);
      expect(asset.ok(), ref).toBe(true);
      expect(asset.headers()["content-type"], ref).not.toMatch(/text\/html/);
      expect((await asset.body()).byteLength, ref).toBeGreaterThan(0);
    }));

    const files: [string, RegExp][] = [
      ["models/character.enc", /^(?!text\/html)/],
      ["models/char_enviorment.hdr", /^(?!text\/html)/],
      ["images/character-mobile.png", /image\/png/],
      ["draco/draco_decoder.js", /(?:application|text)\/javascript/],
      ["draco/draco_decoder.wasm", /application\/wasm/],
      ["video/video.webm", /video\/webm/],
      ["images/etrm-migration.svg", /image\/svg\+xml/],
      ["images/market-data.svg", /image\/svg\+xml/],
      ["images/pharma-analytics.svg", /image\/svg\+xml/],
      ["images/tableau-automation.svg", /image\/svg\+xml/],
    ];
    await Promise.all(files.map(async ([path, contentType]) => {
      const asset = await request.get(new URL(path, site).href);
      expect(asset.ok(), path).toBe(true);
      expect(asset.headers()["content-type"], path).toMatch(contentType);
      expect((await asset.body()).byteLength, path).toBeGreaterThan(0);
    }));
  });

  test("loads the built character, direct links, and project image", async ({ page }) => {
    await page.goto(`${site}#about`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "ready", { timeout: 30000 });
    await expect(page.locator(".loading-screen")).toHaveCount(0, { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() =>
      Math.abs(document.getElementById("about")!.getBoundingClientRect().top)
    ), { timeout: 10000 }).toBeLessThanOrEqual(105);
    await page.locator('.header a[data-href="#work"]').click();
    await expect(page).toHaveURL(/#work$/);
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("work");
    await expect.poll(() => page.locator(".work-image img").first().evaluate(
      (image) => (image as HTMLImageElement).naturalWidth
    )).toBeGreaterThan(0);
  });

  test("a failed built scene chunk releases loading and shows the portrait", async ({ page }) => {
    const sceneChunk = readdirSync(assets).find((file) =>
      file.endsWith(".js") &&
      readFileSync(join(assets, file), "utf8").includes("Desktop character graphics unavailable")
    );
    if (!sceneChunk) throw new Error("Could not identify the production desktop scene chunk");
    await page.route(`**/assets/${sceneChunk}`, (route) => route.abort());
    await page.goto(site, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".character-model")).toHaveAttribute("data-graphics", "fallback", { timeout: 30000 });
    await expect(page.locator(".loading-screen")).toHaveCount(0, { timeout: 30000 });
    await expect.poll(() => page.locator(".character-fallback").evaluate(
      (image) => (image as HTMLImageElement).naturalWidth
    )).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() =>
      document.documentElement.classList.contains("lenis-stopped")
    )).toBe(false);
  });

  test("a failed built mobile scene chunk leaves the page and portrait usable", async ({ page }) => {
    const sceneChunk = readdirSync(assets).find((file) => /^MobileCharacter-.*\.js$/.test(file));
    if (!sceneChunk) throw new Error("Could not identify the production mobile scene chunk");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(`**/assets/${sceneChunk}`, (route) => route.abort());
    await page.goto(site, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".mobile-character")).toHaveAttribute("data-graphics", "fallback", { timeout: 30000 });
    await expect(page.locator(".loading-screen")).toHaveCount(0, { timeout: 30000 });
    await expect.poll(() => page.locator(".mobile-character-portrait").evaluate(
      (image) => (image as HTMLImageElement).naturalWidth
    )).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() =>
      document.documentElement.classList.contains("lenis-stopped")
    )).toBe(false);
  });
});
