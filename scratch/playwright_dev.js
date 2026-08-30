import { spawn } from "child_process";
import { chromium } from "playwright-core";

const sleep = (ms) => new Promise((resolve) => resolve(setTimeout(resolve, ms)));

async function main() {
  console.log("Starting Astro dev server...");
  const devServer = spawn("npx", ["astro", "dev", "--port", "4321"], {
    cwd: "d:\\Code\\Template Website",
    shell: true,
  });

  devServer.stderr.on("data", (data) => {
    console.error(`[Astro Stderr]: ${data}`);
  });

  await sleep(4000);

  console.log("Launching local Chrome with Playwright...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();

  page.on("pageerror", (err) => {
    console.error("\n[PAGE ERROR EXCEPTION]:", err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    console.error("");
  });

  page.on("console", (msg) => {
    console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`);
  });

  const url = "http://localhost:4321/MyPortfolio/";
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url);
    await sleep(6000);
  } catch (err) {
    console.error("Navigation error:", err);
  } finally {
    console.log("Closing browser and dev server...");
    await browser.close();
    devServer.kill("SIGINT");
  }
}

main().catch((err) => {
  console.error("Diagnostic script crashed:", err);
});
