import type Lenis from "lenis";

export let lenis: Lenis | null = null;

export function setLenis(controller: Lenis | null) {
  lenis = controller;
}

export function activatePage() {
  document.body.style.overflowY = "auto";
  lenis?.start();
  document.querySelector("main.main-body")?.classList.add("main-active");
}
