import { TextSplitter } from "../../utils/textSplitter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMotionPaused, prefersReducedMotion, subscribeMotion } from "../../utils/motion";
import { activatePage, lenis } from "../../utils/pageLifecycle";

export function initialFX() {
  activatePage();
  let active = true;
  const cleanups: (() => void)[] = [];
  const splitters: TextSplitter[] = [];
  const hash = window.location.hash;

  if (hash && hash !== "#") {
    let interrupted = false;
    const interactionEvents = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    const stopWatching = () => {
      interactionEvents.forEach((event) => window.removeEventListener(event, onInteraction));
    };
    const onInteraction = () => {
      interrupted = true;
      stopWatching();
    };
    interactionEvents.forEach((event) => window.addEventListener(event, onInteraction, { passive: true }));
    const restoreHash = () => {
      if (!active || interrupted || window.location.hash !== hash) return;
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch (error) {
        console.warn("Invalid section URL:", error);
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      ScrollTrigger.refresh();
      lenis?.resize();
      target.scrollIntoView({ block: "start" });
    };
    const timer = window.setTimeout(() => {
      restoreHash();
      if (document.fonts.status === "loaded") {
        stopWatching();
      } else {
        document.fonts.ready.then(() => {
          restoreHash();
          stopWatching();
        });
      }
    }, 500);
    cleanups.push(() => {
      window.clearTimeout(timer);
      stopWatching();
    });
  }

  const context = gsap.context(() => {
    if (prefersReducedMotion()) {
      // Show the hero in its final state without entrance or looping text motion.
      gsap.set("body", { backgroundColor: "#0b080c" });
      gsap.set([".header", ".nav-fade", ".landing-info-h2"], { opacity: 1, y: 0 });
      return;
    }

    gsap.to("body", {
      backgroundColor: "#0b080c",
      duration: 0.5,
      delay: 1,
    });

    const selectors = [".landing-info h3", ".landing-intro h2", ".landing-intro h1"];
    const elements = selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
    const landingText = new TextSplitter(elements, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    splitters.push(landingText);
    gsap.fromTo(
      landingText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
        delay: 0.3,
      }
    );

    const TextProps = { type: "chars,lines", linesClass: "split-h2" };

    const landingText2 = new TextSplitter(".landing-h2-info", TextProps);
    splitters.push(landingText2);
    gsap.fromTo(
      landingText2.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
        delay: 0.3,
      }
    );

    gsap.fromTo(
      ".landing-info-h2",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
        y: 0,
        delay: 0.8,
      }
    );
    gsap.fromTo(
      [".header", ".nav-fade"],
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
        delay: 0.1,
      }
    );

    const landingText3 = new TextSplitter(".landing-h2-info-1", TextProps);
    const landingText4 = new TextSplitter(".landing-h2-1", TextProps);
    const landingText5 = new TextSplitter(".landing-h2-2", TextProps);
    splitters.push(landingText3, landingText4, landingText5);

    if (landingText3.chars.length) {
      cleanups.push(LoopText(landingText2, landingText3));
    } else {
      revealStaticText(landingText2.chars, 0.3);
    }
    if (landingText5.chars.length) {
      cleanups.push(LoopText(landingText4, landingText5));
    } else {
      revealStaticText(landingText4.chars, 0);
    }
  });

  return () => {
    active = false;
    cleanups.forEach((cleanup) => cleanup());
    context.revert();
    splitters.forEach((splitter) => splitter.revert());
  };
}

function revealStaticText(chars: Element[], delay: number) {
  gsap.fromTo(
    chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay,
    }
  );
}

function LoopText(Text1: TextSplitter, Text2: TextSplitter) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  const syncPause = () => tl.paused(isMotionPaused());
  const unsubscribe = subscribeMotion(syncPause);
  const delay = 4;
  const delay2 = delay * 2 + 1;

  tl.fromTo(
    Text2.chars,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power3.inOut",
      y: 0,
      stagger: 0.1,
      delay: delay,
    },
    0
  )
    .fromTo(
      Text1.chars,
      { y: 80 },
      {
        duration: 1.2,
        ease: "power3.inOut",
        y: 0,
        stagger: 0.1,
        delay: delay2,
      },
      1
    )
    .fromTo(
      Text1.chars,
      { y: 0 },
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay,
      },
      0
    )
    .to(
      Text2.chars,
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay2,
      },
      1
    );
  syncPause();
  return () => {
    unsubscribe();
    tl.kill();
  };
}
