import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { decryptFile } from "./decrypt";
import { assetUrl } from "../../../config";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(assetUrl("draco/"));
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = async (): Promise<GLTF> => {
    let blobUrl: string | undefined;
    try {
      const decrypted = await decryptFile(
        assetUrl("models/character.enc"),
        "Character3D#@"
      );
      blobUrl = URL.createObjectURL(new Blob([decrypted]));
      const gltf = await loader.loadAsync(blobUrl);
      const character = gltf.scene;
      await renderer.compileAsync(character, camera, scene);
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
      console.error("Error loading GLTF model:", error);
      throw error;
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      dracoLoader.dispose();
    }
  };

  return { loadCharacter };
};

export default setCharacter;
