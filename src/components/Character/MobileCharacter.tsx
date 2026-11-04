import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { mobileCharacterPortraitUrl } from "../../config";
import setCharacter from "./utils/character";
import { setMobileExpression } from "./utils/mobileExpression";
import { disposeObject as disposeCharacter } from "./utils/dispose";

const MobileCharacter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.error("Mobile character graphics unavailable:", error);
      setStatus("fallback");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
    camera.position.set(0, 12.2, 18);
    camera.zoom = 1.2;
    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(2, 16, 12);
    const rimLight = new THREE.DirectionalLight(0xc481ff, 4);
    rimLight.position.set(-4, 16, -4);
    scene.add(new THREE.HemisphereLight(0xe7d4ff, 0x19101f, 2), keyLight, rimLight);

    let active = true;
    let character: THREE.Object3D | undefined;
    let introMixer: THREE.AnimationMixer | undefined;
    let expressionMixer: THREE.AnimationMixer | undefined;
    let blinkMixer: THREE.AnimationMixer | undefined;
    let blinkAction: THREE.AnimationAction | undefined;
    let blinkDuration = 0;
    let blinkTimer: number | undefined;
    let animationFrame: number | undefined;
    let visible = false;
    let graphicsReady = false;
    let renderedWidth = 0;
    let renderedHeight = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const render = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!active || !width || !height || renderer.getContext().isContextLost()) return false;
      if (width !== renderedWidth || height !== renderedHeight) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderedWidth = width;
        renderedHeight = height;
      }
      renderer.render(scene, camera);
      return true;
    };

    const canBlink = () =>
      active &&
      visible &&
      graphicsReady &&
      !document.hidden &&
      !reducedMotion.matches &&
      !renderer.getContext().isContextLost() &&
      Boolean(blinkAction && blinkMixer);

    const stopMotion = () => {
      if (blinkTimer !== undefined) window.clearTimeout(blinkTimer);
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      blinkTimer = undefined;
      animationFrame = undefined;
      if (blinkAction?.isScheduled()) {
        blinkAction.stop();
        render();
      }
    };

    const scheduleBlink = () => {
      if (!canBlink() || blinkTimer !== undefined || animationFrame !== undefined) return;
      blinkTimer = window.setTimeout(() => {
        blinkTimer = undefined;
        if (!canBlink() || !blinkAction || !blinkMixer) return;

        blinkAction.reset().play();
        let previousTime: number | undefined;
        const animate = (time: number) => {
          animationFrame = undefined;
          if (!canBlink() || !blinkAction || !blinkMixer) {
            stopMotion();
            return;
          }

          const delta = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.1);
          previousTime = time;
          blinkMixer.update(delta);
          if (!render()) {
            stopMotion();
            return;
          }

          if (blinkAction.time >= blinkDuration) {
            blinkAction.stop();
            render();
            scheduleBlink();
          } else {
            animationFrame = window.requestAnimationFrame(animate);
          }
        };
        animationFrame = window.requestAnimationFrame(animate);
      }, 3500 + Math.random() * 2500);
    };

    const syncMotion = () => {
      if (canBlink()) scheduleBlink();
      else stopMotion();
    };
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncMotion();
      },
      { threshold: 0.15 }
    );
    visibility.observe(container);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);

    const resize = new ResizeObserver(render);
    resize.observe(container);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      graphicsReady = false;
      stopMotion();
      setStatus("fallback");
      console.error("Mobile character WebGL context lost; showing its portrait.");
    };
    const onContextRestored = () => {
      renderedWidth = 0;
      renderedHeight = 0;
      const rendered = render();
      graphicsReady = Boolean(character && rendered);
      setStatus(graphicsReady ? "ready" : character ? "fallback" : "loading");
      syncMotion();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    const { loadCharacter } = setCharacter(renderer, scene, camera);
    loadCharacter()
      .then((gltf) => {
        if (!active) {
          disposeCharacter(gltf.scene);
          return;
        }
        character = gltf.scene;
        const intro = gltf.animations.find((clip) => clip.name === "introAnimation");
        if (intro) {
          introMixer = new THREE.AnimationMixer(character);
          const action = introMixer.clipAction(intro);
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
          introMixer.update(intro.duration);
        }
        expressionMixer = setMobileExpression(character, gltf.animations);
        const blink = gltf.animations.find((clip) => clip.name === "Blink");
        if (blink) {
          // Use one complete blink from the template's 24fps animation.
          const singleBlink = THREE.AnimationUtils.subclip(blink, "mobile-blink", 10, 20, 24);
          blinkMixer = new THREE.AnimationMixer(character);
          blinkAction = blinkMixer.clipAction(singleBlink);
          blinkAction.setLoop(THREE.LoopOnce, 1);
          blinkAction.clampWhenFinished = true;
          blinkDuration = singleBlink.duration;
        } else {
          console.warn("Mobile character blink animation not found; displaying a static character.");
        }
        const monitor = character.getObjectByName("Plane004");
        if (monitor) {
          disposeCharacter(monitor);
          monitor.removeFromParent();
        }
        const screenLight = character.getObjectByName("screenlight");
        if (screenLight) screenLight.visible = false;
        character.rotation.y = -0.08;
        scene.add(character);
        graphicsReady = render();
        setStatus(graphicsReady ? "ready" : "fallback");
        syncMotion();
      })
      .catch((error: unknown) => {
        console.error("Mobile character failed to load; showing its portrait:", error);
        if (active) {
          graphicsReady = false;
          stopMotion();
          setStatus("fallback");
        }
      });

    return () => {
      active = false;
      stopMotion();
      visibility.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      if (character) {
        const currentCharacter = character;
        [introMixer, expressionMixer, blinkMixer].forEach((mixer) => {
          mixer?.stopAllAction();
          mixer?.uncacheRoot(currentCharacter);
        });
        disposeCharacter(currentCharacter);
      }
      scene.clear();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className={`mobile-character${status === "ready" ? " mobile-character-ready" : ""}`}
      data-graphics={status}
      aria-label={`Stylised character from the portfolio template${status === "fallback" ? " (portrait fallback)" : ""}`}
      role="img"
    >
      <img
        className="mobile-character-portrait"
        src={mobileCharacterPortraitUrl}
        alt=""
        width="480"
        height="480"
      />
      <div className="mobile-character-canvas" ref={containerRef} aria-hidden="true" />
    </div>
  );
};

export default MobileCharacter;
