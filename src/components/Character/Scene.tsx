import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize, { getRenderPixelRatio } from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { disposeObject } from "./utils/dispose";
import { setProgress } from "../Loading";
import { setCharTimeline } from "../utils/GsapScroll";
import { isMotionPaused, prefersReducedMotion, subscribeMotion } from "../../utils/motion";
import { mobileCharacterPortraitUrl } from "../../config";

type GraphicsStatus = "loading" | "ready" | "fallback";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();
  const [status, setStatus] = useState<GraphicsStatus>("loading");

  useEffect(() => {
    const container = canvasDiv.current;
    if (!container) return;

    let active = true;
    const timers = new Set<number>();
    const later = (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (active) callback();
      }, delay);
      timers.add(id);
    };
    const progress = setProgress((value) => setLoading(value));

    // Any graphics failure releases the loader and shows the static portrait.
    const showFallback = (message: string, error?: unknown) => {
      if (!active) return;
      console.error(message, error ?? "");
      setStatus("fallback");
      progress.clear();
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        // Rendering is capped below a 2x display's ratio, so keep MSAA for edges.
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (error) {
      showFallback("Desktop character graphics unavailable; showing its portrait:", error);
      return () => {
        active = false;
        progress.stop();
      };
    }

    const rect = container.getBoundingClientRect();
    const scene = new THREE.Scene();
    renderer.setPixelRatio(getRenderPixelRatio());
    renderer.setSize(rect.width, rect.height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, rect.width / rect.height, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let headBone: THREE.Object3D | null = null;
    let screenLight: THREE.Object3D | null = null;
    let character: THREE.Object3D | null = null;
    let animations: ReturnType<typeof setAnimations> | null = null;
    let removeTimelines: (() => void) | null = null;
    let frame: number | undefined;
    let inView = true;
    const clock = new THREE.Clock(false);
    const light = setLighting(scene);

    const contextLost = () => renderer.getContext().isContextLost();
    const shouldRun = () =>
      active && inView && !document.hidden && !contextLost() && Boolean(character);

    let mouse = { x: 0, y: 0 },
      interpolation = { x: 0.1, y: 0.2 };

    const animate = () => {
      frame = undefined;
      if (!shouldRun()) {
        clock.stop();
        return;
      }
      frame = requestAnimationFrame(animate);
      // Clamp so a resumed loop never jumps the mixer forward by the paused duration.
      const delta = Math.min(clock.getDelta(), 0.1);
      // Reduced motion hides the scene past About; skip work while it is invisible.
      if (container.style.visibility === "hidden") return;
      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        light.setPointLight(screenLight);
      }
      if (animations && !isMotionPaused()) animations.mixer.update(delta);
      renderer.render(scene, camera);
    };
    const resume = () => {
      if (frame !== undefined || !shouldRun()) return;
      clock.start();
      frame = requestAnimationFrame(animate);
    };
    const pause = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      clock.stop();
    };
    const syncLoop = () => (shouldRun() ? resume() : pause());

    // The fixed canvas leaves the viewport via transforms after Experience begins.
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncLoop();
    });
    visibility.observe(container);
    document.addEventListener("visibilitychange", syncLoop);

    const buildTimelines = () => {
      removeTimelines?.();
      removeTimelines = character ? setCharTimeline(character, camera) : null;
    };
    let timelinesReduced = prefersReducedMotion();
    const onMotionChange = () => {
      if (!character) return;
      // Reduced motion uses static poses instead of scrubbed timelines.
      const reduced = prefersReducedMotion();
      if (reduced !== timelinesReduced) {
        timelinesReduced = reduced;
        buildTimelines();
      }
    };
    const unsubscribeMotion = subscribeMotion(onMotionChange);

    const onResize = () => handleResize(renderer, camera, canvasDiv);
    window.addEventListener("resize", onResize);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      pause();
      removeTimelines?.();
      removeTimelines = null;
      showFallback("Desktop character WebGL context lost; showing its portrait.");
    };
    const onContextRestored = () => {
      if (!active || !character) return;
      onResize();
      buildTimelines();
      setStatus("ready");
      syncLoop();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    const { loadCharacter } = setCharacter(renderer, scene, camera);
    loadCharacter()
      .then((gltf) => {
        if (!active || contextLost()) {
          disposeObject(gltf.scene);
          if (active) showFallback("Desktop character WebGL context lost while loading.");
          return;
        }
        character = gltf.scene;
        animations = setAnimations(gltf);
        if (hoverDivRef.current) animations.hover(gltf, hoverDivRef.current);
        scene.add(character);
        headBone = character.getObjectByName("spine006") || null;
        screenLight = character.getObjectByName("screenlight") || null;
        timelinesReduced = prefersReducedMotion();
        buildTimelines();
        setStatus("ready");
        renderer.render(scene, camera);
        progress.loaded().then(() => {
          if (!active) return;
          const reduced = prefersReducedMotion();
          // Reduced motion skips the delayed intro and fades.
          later(() => {
            light.turnOnLights(reduced);
            animations?.startIntro(reduced);
          }, reduced ? 0 : 2500);
        });
        syncLoop();
      })
      .catch((error: unknown) => {
        showFallback("Desktop character failed to load; showing its portrait:", error);
      });

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => (mouse = { x, y }));
    };
    let trackTouch = false;
    let cancelTouchEnd: (() => void) | undefined;
    const onTouchStart = () => {
      later(() => (trackTouch = true), 200);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (trackTouch) handleTouchMove(event, (x, y) => (mouse = { x, y }));
    };
    const onTouchEnd = () => {
      trackTouch = false;
      cancelTouchEnd?.();
      cancelTouchEnd = handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    landingDiv?.addEventListener("touchstart", onTouchStart);
    landingDiv?.addEventListener("touchmove", onTouchMove);
    landingDiv?.addEventListener("touchend", onTouchEnd);

    return () => {
      active = false;
      pause();
      progress.stop();
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      cancelTouchEnd?.();
      visibility.disconnect();
      unsubscribeMotion();
      document.removeEventListener("visibilitychange", syncLoop);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      landingDiv?.removeEventListener("touchstart", onTouchStart);
      landingDiv?.removeEventListener("touchmove", onTouchMove);
      landingDiv?.removeEventListener("touchend", onTouchEnd);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      removeTimelines?.();
      animations?.dispose();
      light.dispose();
      if (character) disposeObject(character);
      scene.clear();
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [setLoading]);

  return (
    <div className="character-container">
      <div
        className={`character-model${status === "fallback" ? " character-model-fallback" : ""}`}
        ref={canvasDiv}
        data-graphics={status}
      >
        <div className="character-rim"></div>
        {status === "fallback" && (
          <img
            className="character-fallback"
            src={mobileCharacterPortraitUrl}
            alt="Stylised character from the portfolio template"
            width="480"
            height="480"
          />
        )}
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
    </div>
  );
};

export default Scene;
