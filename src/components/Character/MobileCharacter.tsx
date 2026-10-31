import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { assetUrl } from "../../config";
import setCharacter from "./utils/character";

function disposeCharacter(character: THREE.Object3D) {
  character.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

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
    let mixer: THREE.AnimationMixer | undefined;
    const render = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!active || !width || !height || renderer.getContext().isContextLost()) return false;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return true;
    };

    const resize = new ResizeObserver(render);
    resize.observe(container);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setStatus("fallback");
      console.error("Mobile character WebGL context lost; showing its portrait.");
    };
    const onContextRestored = () => {
      const rendered = render();
      setStatus(character && rendered ? "ready" : "loading");
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    const { loadCharacter } = setCharacter(renderer, scene, camera, false);
    loadCharacter()
      .then((gltf) => {
        if (!active) {
          disposeCharacter(gltf.scene);
          return;
        }
        character = gltf.scene;
        const intro = gltf.animations.find((clip) => clip.name === "introAnimation");
        if (intro) {
          mixer = new THREE.AnimationMixer(character);
          const action = mixer.clipAction(intro);
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
          mixer.update(intro.duration);
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
        setStatus(render() ? "ready" : "fallback");
      })
      .catch((error: unknown) => {
        console.error("Mobile character failed to load; showing its portrait:", error);
        if (active) setStatus("fallback");
      });

    return () => {
      active = false;
      resize.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      if (character) {
        mixer?.stopAllAction();
        mixer?.uncacheRoot(character);
        disposeCharacter(character);
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
        src={assetUrl("images/character-mobile.png")}
        alt=""
        width="480"
        height="480"
      />
      <div className="mobile-character-canvas" ref={containerRef} aria-hidden="true" />
    </div>
  );
};

export default MobileCharacter;
