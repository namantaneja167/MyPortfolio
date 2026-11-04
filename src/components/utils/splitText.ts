import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextSplitter } from "../../utils/textSplitter";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: TextSplitter;
}

gsap.registerPlugin(ScrollTrigger);

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = () => motionQuery.matches;

let builtFor: string | null = null;
// Tracked directly because React may detach these nodes before cleanup runs.
const built = new Set<ParaElement>();
let registered = false;
let fontsPending = false;

function revertElement(element: ParaElement) {
  element.anim?.scrollTrigger?.kill();
  element.anim?.kill();
  element.split?.revert();
  delete element.anim;
  delete element.split;
  built.delete(element);
}

function revertAll() {
  built.forEach(revertElement);
  builtFor = null;
}

function build() {
  const paras = document.querySelectorAll<ParaElement>(".para");
  const titles = document.querySelectorAll<ParaElement>(".title");
  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
  const ToggleAction = "play pause resume reverse";

  paras.forEach((para) => {
    built.add(para);
    para.classList.add("visible");
    para.split = new TextSplitter(para, {
      type: "lines,words",
      linesClass: "split-line",
    });
    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 80 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.02,
      }
    );
  });
  titles.forEach((title) => {
    built.add(title);
    title.split = new TextSplitter(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: 0.03,
      }
    );
  });
}

// Line breaks depend on width and fonts, so only those changes rebuild the split.
function sync(force = false) {
  const key = window.innerWidth >= 900 && !reducedMotion() ? `${window.innerWidth}` : null;
  if (!force && key === builtFor) return;
  revertAll();
  if (key === null) return;
  build();
  builtFor = key;
}

const onRefresh = () => sync();
const onMotionChange = () => sync();

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (!registered) {
    registered = true;
    ScrollTrigger.addEventListener("refresh", onRefresh);
    motionQuery.addEventListener("change", onMotionChange);
    if (document.fonts && document.fonts.status !== "loaded") {
      fontsPending = true;
      document.fonts.ready.then(() => {
        if (!fontsPending) return;
        fontsPending = false;
        if (registered) sync(true);
      });
    }
  }
  sync();
}

export function destroySplitText() {
  if (registered) {
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    motionQuery.removeEventListener("change", onMotionChange);
  }
  registered = false;
  fontsPending = false;
  revertAll();
}
