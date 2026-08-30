import { spawn } from "child_process";
import fs from "fs";

// Helper to wait
const sleep = (ms) => new Promise((resolve) => resolve(setTimeout(resolve, ms)));

async function main() {
  console.log("Starting Astro dev server...");
  const devServer = spawn("npx", ["astro", "dev", "--port", "4321"], {
    cwd: "d:\\Code\\Template Website",
    shell: true,
  });

  devServer.stdout.on("data", (data) => {
    // console.log(`[Astro Stdout]: ${data}`);
  });

  devServer.stderr.on("data", (data) => {
    console.error(`[Astro Stderr]: ${data}`);
  });

  // Wait for Astro to boot
  await sleep(4000);

  console.log("Starting headless Chrome...");
  const chromeProfile = "C:\\Users\\NAMAN\\.gemini\\antigravity\\brain\\chrome-profile";
  if (!fs.existsSync(chromeProfile)) {
    fs.mkdirSync(chromeProfile, { recursive: true });
  }

  const chromeCmd = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --remote-debugging-port=9222 --disable-gpu --user-data-dir="${chromeProfile}" about:blank`;
  const chrome = spawn(chromeCmd, [], { shell: true });

  await sleep(4000);

  try {
    console.log("Opening page in Chrome...");
    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:4321/MyPortfolio/");
    const tabInfo = await newTabRes.json();
    console.log("Opened tab info:", tabInfo);

    const wsUrl = tabInfo.webSocketDebuggerUrl;
    if (!wsUrl) {
      throw new Error("No webSocketDebuggerUrl returned!");
    }

    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);

    const logs = [];
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.consoleAPICalled") {
        const type = msg.params.type;
        const text = msg.params.args.map((arg) => arg.value || arg.description || JSON.stringify(arg)).join(" ");
        logs.push(`[Console ${type}]: ${text}`);
      } else if (msg.method === "Runtime.exceptionThrown") {
        const exception = msg.params.exceptionDetails;
        logs.push(`[Exception]: ${exception.text} ${exception.exception ? exception.exception.description : ""}`);
      }
    };

    ws.onopen = () => {
      console.log("WebSocket open! Enabling domains...");
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
      ws.send(JSON.stringify({ id: 2, method: "Log.enable" }));
    };

    // Wait for the page to render and execute JS
    await sleep(6000);

    console.log("\n--- Collected Browser Logs ---");
    if (logs.length === 0) {
      console.log("No logs collected.");
    } else {
      logs.forEach((log) => console.log(log));
    }
    console.log("-------------------------------\n");

    ws.close();
  } catch (err) {
    console.error("Error running test:", err);
  } finally {
    console.log("Cleaning up processes...");
    devServer.kill("SIGINT");
    chrome.kill("SIGINT");
  }
}

main();
