const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "portfolio-motion-paused";
const listeners = new Set<() => void>();

let userPaused = (() => {
  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
})();

export const prefersReducedMotion = () => reducedQuery.matches;

// Persistent decorative motion stops for either the OS preference or the page toggle.
export const isMotionPaused = () => reducedQuery.matches || userPaused;

export const isUserMotionPaused = () => userPaused;

function emit() {
  document.documentElement.classList.toggle("motion-paused", isMotionPaused());
  listeners.forEach((listener) => listener());
}

export function setUserMotionPaused(paused: boolean) {
  userPaused = paused;
  try {
    window.localStorage.setItem(storageKey, paused ? "1" : "0");
  } catch {
    // Storage can be unavailable in private modes; the toggle still applies for this visit.
  }
  emit();
}

export function subscribeMotion(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

reducedQuery.addEventListener("change", emit);
emit();
