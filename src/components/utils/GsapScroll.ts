import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMotionPaused, prefersReducedMotion, subscribeMotion } from "../../utils/motion";

// Reduced motion keeps the fixed canvas and the Home/About poses, switched instantly.
// The monitor stays transparent because its reveal belongs to the scrubbed What I Do scene.
function setStaticCharacter(
  character: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  onVisibilityChange?: () => void
) {
  let pose: "home" | "about" | "hidden" | null = null;
  const apply = () => {
    const about = document.querySelector(".about-section");
    const whatIDo = document.querySelector(".whatIDO");
    if (!about || !whatIDo) return;
    const next = whatIDo.getBoundingClientRect().top < window.innerHeight * 0.6
      ? "hidden"
      : about.getBoundingClientRect().top < window.innerHeight * 0.5
        ? "about"
        : "home";
    if (next === pose) return;
    pose = next;
    const inAbout = next !== "home";
    gsap.set(".character-model", {
      x: inAbout ? "-25%" : 0,
      autoAlpha: next === "hidden" ? 0 : 1,
      pointerEvents: next === "home" ? "inherit" : "none",
    });
    character.rotation.set(0, inAbout ? 0.7 : 0, 0);
    camera.position.z = inAbout ? 22 : 24.7;
    onVisibilityChange?.();
  };
  const trigger = ScrollTrigger.create({
    trigger: ".landing-section",
    endTrigger: ".whatIDO",
    start: "top top",
    end: "bottom top",
    onUpdate: apply,
    onToggle: apply,
    onRefresh: apply,
  });
  apply();
  return trigger;
}

// Returns a teardown that reverts every tween, trigger and listener it created.
export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera,
  onVisibilityChange?: () => void
): () => void {
  const reducedMotion = prefersReducedMotion();
  const cleanups: (() => void)[] = [];
  const teardown = () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    cleanups.length = 0;
  };
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top 85%",
      end: "bottom 75%",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl4 = gsap.timeline({
    scrollTrigger: {
      // Begin where tl3 ends so the fixed character clears the career copy
      // before that copy scrolls into the character's painted area.
      trigger: ".career-section",
      start: "top 75%",
      end: "top 15%",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  let screenLight: any, monitor: any;
  character?.children.forEach((object: any) => {
    if (object.name === "Plane004") {
      object.children.forEach((child: any) => {
        child.material.transparent = true;
        child.material.opacity = 0;
        if (child.material.name === "Material.027") {
          monitor = child;
          child.material.color.set("#FFFFFF");
        }
      });
    }
    if (object.name === "screenlight") {
      object.material.transparent = true;
      object.material.opacity = 0;
      object.material.emissive.set("#C8BFFF");
      if (!reducedMotion) {
        const flicker = gsap.timeline({ repeat: -1, repeatRefresh: true }).to(object.material, {
          emissiveIntensity: () => Math.random() * 8,
          duration: () => Math.random() * 0.6,
          delay: () => Math.random() * 0.1,
        });
        const syncFlicker = () => flicker.paused(isMotionPaused());
        syncFlicker();
        const unsubscribe = subscribeMotion(syncFlicker);
        cleanups.push(() => {
          unsubscribe();
          flicker.kill();
        });
      }
      screenLight = object;
    }
  });
  const scrollTimelines = [tl1, tl2, tl3, tl4];
  cleanups.push(() => {
    scrollTimelines.forEach((timeline) => {
      timeline.scrollTrigger?.kill();
      timeline.revert();
      timeline.kill();
    });
  });
  if (reducedMotion) {
    scrollTimelines.forEach((timeline) => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    });
    scrollTimelines.length = 0;
    if (window.innerWidth > 1024 && character) {
      const trigger = setStaticCharacter(character, camera, onVisibilityChange);
      cleanups.push(() => {
        trigger.kill();
        gsap.set(".character-model", { clearProps: "x,visibility,opacity,pointerEvents" });
      });
    }
    return teardown;
  }
  const neckBone = character?.getObjectByName("spine005");
  if (window.innerWidth > 1024) {
    if (character) {
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

      tl2
        .to(
          camera.position,
          { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
          0
        )
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5, immediateRender: false },
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
        .to(neckBone!.rotation, { x: 0.6, delay: 2, duration: 3 }, 0)
        .to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
        .to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0)
        .fromTo(
          monitor.position,
          { y: -10, z: 2 },
          { y: 0, z: 0, delay: 1.5, duration: 3 },
          0
        )
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
          0.3
        );

      // tl2 is still scrubbing x when tl3 starts, so tl3 offsets the model with
      // xPercent/yPercent, which GSAP composes with x instead of overwriting it.
      // xPercent starts from the CSS translateX(-50%) centring.
      tl3
        .fromTo(
          ".character-model",
          { xPercent: -50, yPercent: 0, scale: 1, zIndex: 11 },
          {
            xPercent: -39,
            yPercent: -15,
            scale: 0.88,
            zIndex: 8,
            duration: 1,
            ease: "none",
            immediateRender: false,
          },
          0
        )
        .to(character.rotation, { x: -0.04, duration: 1 }, 0);

      tl4.fromTo(
        ".character-model",
        { yPercent: -15 },
        { yPercent: -100, duration: 1, ease: "none", immediateRender: false },
        0
      );

      // Several timelines tween .character-model; after a refresh invalidates
      // them, re-apply their states in order so a stale later pose cannot win.
      const timelines = [tl1, tl2, tl3, tl4];
      const syncCharacterTimelines = () => {
        [...timelines].reverse().forEach((timeline) => {
          timeline.progress(0.001, true).progress(0, true);
        });
        timelines.forEach((timeline) => {
          timeline.progress(timeline.scrollTrigger?.progress ?? 0, true);
        });
      };
      ScrollTrigger.addEventListener("refresh", syncCharacterTimelines);
      cleanups.push(() =>
        ScrollTrigger.removeEventListener("refresh", syncCharacterTimelines)
      );
    }
  } else {
    if (character) {
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
      cleanups.push(() => {
        tM2.scrollTrigger?.kill();
        tM2.revert();
      });
    }
  }
  return teardown;
}

export function setAllTimeline() {
  if (prefersReducedMotion()) {
    gsap.set(".career-timeline", { maxHeight: "100%", opacity: 1 });
    return;
  }
  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-info",
      start: "top 85%",
      end: "bottom 70%",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "0%" },
      { maxHeight: "100%", duration: 1, ease: "none" },
      0
    )

    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  gsap.utils.toArray<HTMLElement>(".career-info-box").forEach((row) => {
    gsap.fromTo(
      row,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        scrollTrigger: {
          trigger: row,
          start: "top 95%",
          toggleActions: "play none none none",
          invalidateOnRefresh: true,
        },
      }
    );
  });
}
