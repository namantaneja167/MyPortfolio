import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:5173/MyPortfolio/",
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
    launchOptions: {
      args: ["--disable-features=OverlayScrollbar", "--enable-unsafe-swiftshader"],
    },
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium", channel: "chromium" } },
    { name: "edge", use: { browserName: "chromium", channel: "msedge" } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
    url: "http://127.0.0.1:5173/MyPortfolio/",
    reuseExistingServer: !process.env.CI,
  },
});
