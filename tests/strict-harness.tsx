// Dev-only harness: mounts and unmounts the whole app under React Strict Mode so tests
// can check that every mount/cleanup cycle releases what it created.
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../src/index.css";

type Listener = { target: EventTarget; type: string; listener: unknown; capture: boolean; owner: string };

// The first stack frame outside this harness identifies the module that registered the listener.
const ownerOf = () => {
  const frames = (new Error().stack ?? "").split("\n").slice(1)
    .filter((frame) => frame.includes("http") && !frame.includes("strict-harness"));
  const match = frames[0]?.match(/https?:\/\/[^/]+(\/[^?:]+)/);
  return match ? match[1].replace(/^\/MyPortfolio/, "") : "unknown";
};

const globalListeners: Listener[] = [];
const refreshListeners = new Set<unknown>();
let removedDuringMount = 0;
const isGlobal = (target: EventTarget) =>
  target === window || target === document || target === document.documentElement || target === document.body;
const captureOf = (options?: boolean | EventListenerOptions) =>
  typeof options === "boolean" ? options : Boolean(options?.capture);

const add = EventTarget.prototype.addEventListener;
const remove = EventTarget.prototype.removeEventListener;
EventTarget.prototype.addEventListener = function (type, listener, options) {
  const capture = captureOf(options);
  if (listener && isGlobal(this) && !globalListeners.some((entry) =>
    entry.target === this && entry.type === type && entry.listener === listener && entry.capture === capture
  )) {
    globalListeners.push({ target: this, type, listener, capture, owner: ownerOf() });
  }
  return add.call(this, type, listener, options);
};
EventTarget.prototype.removeEventListener = function (type, listener, options) {
  const capture = captureOf(options);
  const index = globalListeners.findIndex((entry) =>
    entry.target === this && entry.type === type && entry.listener === listener && entry.capture === capture
  );
  if (index >= 0) {
    globalListeners.splice(index, 1);
    removedDuringMount++;
  }
  return remove.call(this, type, listener, options);
};

const addRefresh = ScrollTrigger.addEventListener.bind(ScrollTrigger);
const removeRefresh = ScrollTrigger.removeEventListener.bind(ScrollTrigger);
ScrollTrigger.addEventListener = (type: string, callback: () => void) => {
  if (type === "refresh") refreshListeners.add(callback);
  return addRefresh(type as "refresh", callback);
};
ScrollTrigger.removeEventListener = (type: string, callback: () => void) => {
  if (type === "refresh") refreshListeners.delete(callback);
  return removeRefresh(type as "refresh", callback);
};

const pendingFrames = new Map<number, FrameRequestCallback>();
const request = window.requestAnimationFrame.bind(window);
const cancel = window.cancelAnimationFrame.bind(window);
window.requestAnimationFrame = (callback) => {
  const id = request((time) => {
    pendingFrames.delete(id);
    callback(time);
  });
  pendingFrames.set(id, callback);
  return id;
};
window.cancelAnimationFrame = (id) => {
  pendingFrames.delete(id);
  cancel(id);
};

let root: Root | null = null;

const harness = {
  async mount() {
    const { default: App } = await import("../src/App");
    removedDuringMount = 0;
    root = createRoot(document.getElementById("root")!);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  },
  unmount() {
    root?.unmount();
    root = null;
  },
  // Describes surviving ScrollTriggers and tweens so a failing assertion names its source.
  leftovers() {
    const describe = (target: unknown) => {
      if (typeof target === "function") return `function ${target.name || "anonymous"}`;
      if (target instanceof Element) return `${target.tagName.toLowerCase()}.${String(target.className).split(" ")[0]}`;
      return (target as object)?.constructor?.name ?? String(target);
    };
    return {
      triggers: ScrollTrigger.getAll().map((trigger) => ({
        trigger: trigger.trigger ? describe(trigger.trigger) : null,
        connected: trigger.trigger?.isConnected ?? null,
        start: String(trigger.vars.start),
      })),
      animations: gsap.globalTimeline.getChildren(true, true, true).map((child) =>
        "targets" in child
          ? (child as gsap.core.Tween).targets().map(describe).join(",") + (child.paused() ? " (paused)" : "")
          : `timeline repeat=${(child as gsap.core.Timeline).repeat()} children=${(child as gsap.core.Timeline).getChildren().length}`
      ),
      frames: [...pendingFrames.values()].map((callback) => callback.name || callback.toString().slice(0, 120)),
    };
  },
  counts() {
    const byOwner: Record<string, number> = {};
    for (const entry of globalListeners) {
      const key = `${entry.owner} ${entry.type}`;
      byOwner[key] = (byOwner[key] ?? 0) + 1;
    }
    return {
      globalListeners: globalListeners.length,
      appListeners: globalListeners.filter((entry) => entry.owner.startsWith("/src/")).length,
      byOwner,
      refreshListeners: refreshListeners.size,
      removedDuringMount,
      triggers: ScrollTrigger.getAll().length,
      tweens: gsap.globalTimeline.getChildren(true, true, true).length,
      canvases: document.querySelectorAll("canvas").length,
      frames: pendingFrames.size,
    };
  },
};

(window as unknown as { harness: typeof harness }).harness = harness;
document.documentElement.dataset.harness = "ready";
