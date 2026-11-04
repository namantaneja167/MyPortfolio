import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { decryptFile } from "./decrypt";
import { disposeObject } from "./dispose";
import { assetUrl } from "../../../config";

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw new DOMException("Character loading cancelled", "AbortError");
};

// Unlike Three's compileAsync, this readiness check can be stopped on unmount.
const waitForShaders = (renderer: THREE.WebGLRenderer, signal?: AbortSignal) => {
  const gl = renderer.getContext();
  const extension = gl.getExtension("KHR_parallel_shader_compile");
  const programs = renderer.info.programs?.slice() ?? [];
  return new Promise<void>((resolve, reject) => {
    let timer: number | undefined;
    const cleanup = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Character loading cancelled", "AbortError"));
    };
    const check = () => {
      if (signal?.aborted) {
        onAbort();
        return;
      }
      if (gl.isContextLost()) {
        cleanup();
        reject(new Error("WebGL context lost during character compilation"));
        return;
      }
      try {
        if (!extension || programs.every(({ program }) =>
          gl.getProgramParameter(program, extension.COMPLETION_STATUS_KHR)
        )) {
          for (const { program } of programs) {
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
              const details = gl.getProgramInfoLog(program)?.trim();
              throw new Error(`Character shader failed to link${details ? `: ${details}` : "."}`);
            }
          }
          cleanup();
          resolve();
          return;
        }
      } catch (error) {
        cleanup();
        reject(error);
        return;
      }
      timer = window.setTimeout(check, 10);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (extension) check();
    else timer = window.setTimeout(check, 10);
  });
};

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(assetUrl("draco/"));
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = async (signal?: AbortSignal): Promise<GLTF> => {
    let blobUrl: string | undefined;
    let gltf: GLTF | undefined;
    try {
      const decrypted = await decryptFile(
        assetUrl("models/character.enc"),
        "Character3D#@",
        signal
      );
      throwIfAborted(signal);
      blobUrl = URL.createObjectURL(new Blob([decrypted]));
      gltf = await loader.loadAsync(blobUrl);
      throwIfAborted(signal);
      const character = gltf.scene;
      renderer.compile(character, camera, scene);
      await waitForShaders(renderer, signal);
      throwIfAborted(signal);
      character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          child.frustumCulled = true;
          if (child.material && !Array.isArray(child.material)) {
            child.material.precision = "mediump";
          }
        }
      });
      ["footR", "footL"].forEach((name) => {
        const foot = character.getObjectByName(name);
        if (foot) foot.position.y = 3.36;
      });
      return gltf;
    } catch (error) {
      if (gltf) disposeObject(gltf.scene);
      throw error;
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      dracoLoader.dispose();
    }
  };

  return { loadCharacter };
};

export default setCharacter;
