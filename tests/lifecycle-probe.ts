import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let rebuilds = 0;
let observer: MutationObserver | undefined;

export function watchTextRebuilds() {
  observer?.disconnect();
  rebuilds = 0;
  const para = document.querySelector(".about-me .para");
  if (!para) throw new Error("About paragraph is missing");
  // TextSplitter rewrites the paragraph when it splits or reverts, never otherwise.
  observer = new MutationObserver((records) => {
    rebuilds += records.filter((record) => record.target === para).length;
  });
  observer.observe(para, { childList: true });
}

export function readTextRebuilds() {
  return rebuilds;
}

export async function refreshTimes(count: number) {
  for (let i = 0; i < count; i++) {
    ScrollTrigger.refresh();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
}

export function counts() {
  return {
    triggers: ScrollTrigger.getAll().length,
    tweens: gsap.globalTimeline.getChildren(true, true, true).length,
    canvases: document.querySelectorAll("canvas").length,
    splitWords: document.querySelectorAll(".split-word").length,
  };
}
