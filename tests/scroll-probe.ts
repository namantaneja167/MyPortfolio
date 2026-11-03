import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenis } from "../src/components/Navbar";

type Sample = { scroll: number; progress: number };
let samples: Sample[] = [];
let trigger: ScrollTrigger | undefined;
let unsubscribe: (() => void) | undefined;

export function startProbe() {
  stopProbe();
  if (!lenis) throw new Error("Portfolio scroll controller is not ready");
  samples = [];
  trigger = ScrollTrigger.create({ start: 0, end: 10000 });
  unsubscribe = lenis.on("scroll", () => {
    samples.push({ scroll: window.scrollY, progress: trigger!.progress });
  });
}

export function readProbe() {
  return {
    samples,
    target: lenis?.targetScroll,
    scrolling: lenis?.isScrolling,
    y: window.scrollY,
  };
}

export function stopProbe() {
  unsubscribe?.();
  trigger?.kill();
}
