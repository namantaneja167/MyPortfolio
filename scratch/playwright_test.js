import { chromium } from "playwright-core";

async function main() {
  console.log("Launching local Chrome with Playwright...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();

  // Listen to page errors (crashes, unhandled exceptions)
  page.on("pageerror", (err) => {
    console.error("\n[PAGE ERROR EXCEPTION]:", err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    console.error("");
  });

  // Listen to console messages
  page.on("console", (msg) => {
    console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`);
  });

  const url = "file:///d:/Code/Template Website/dist/index.html";
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  // Wait a few seconds for hydration/intersection observers to trigger or errors to settle
  await page.waitForTimeout(5000);

  console.log("Closing browser...");
  await browser.close();
}

main().catch((err) => {
  console.error("Diagnostic script crashed:", err);
});
