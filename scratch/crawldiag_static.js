import { spawn } from "child_process";
import fs from "fs";

const sleep = (ms) => new Promise((resolve) => resolve(setTimeout(resolve, ms)));

async function main() {
  console.log("Starting headless Chrome...");
  const chromeProfile = "C:\\Users\\NAMAN\\.gemini\\antigravity\\brain\\chrome-profile-static";
  if (!fs.existsSync(chromeProfile)) {
    fs.mkdirSync(chromeProfile, { recursive: true });
  }

  // Ensure any previous Chrome instances are killed
  try {
    spawn("taskkill", ["/F", "/IM", "chrome.exe"], { shell: true });
    await sleep(1000);
  } catch (e) {}

  const chromeCmd = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --remote-debugging-port=9222 --disable-gpu --no-sandbox --disable-setuid-sandbox --user-data-dir="${chromeProfile}" about:blank`;
  const chrome = spawn(chromeCmd, [], { shell: true });

  await sleep(4000);

  try {
    console.log("Connecting to Chrome target list...");
    const listRes = await fetch("http://127.0.0.1:9222/json/list");
    const targets = await listRes.json();
    console.log("Active targets:", targets);

    const target = targets[0];
    if (!target) {
      throw new Error("No active targets found!");
    }

    const wsUrl = target.webSocketDebuggerUrl;
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
        const desc = exception.exception ? exception.exception.description : "";
        logs.push(`[Exception]: ${exception.text} ${desc}`);
        if (exception.exception && exception.exception.preview) {
          console.log("Exception Preview:", JSON.stringify(exception.exception.preview));
        }
      }
    };

    ws.onopen = () => {
      console.log("WebSocket open! Enabling Runtime and Page...");
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
      ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
      
      // Navigate to the built dist/index.html file
      const filePath = "file:///d:/Code/Template Website/dist/index.html";
      console.log("Navigating to:", filePath);
      ws.send(JSON.stringify({
        id: 3,
        method: "Page.navigate",
        params: { url: filePath }
      }));
    };

    // Wait for page load and hydration
    await sleep(8000);

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
    console.log("Cleaning up Chrome...");
    chrome.kill("SIGINT");
    try {
      spawn("taskkill", ["/F", "/IM", "chrome.exe"], { shell: true });
    } catch (e) {}
  }
}

main();
