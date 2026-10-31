import * as THREE from "three";

export function setMobileExpression(
  character: THREE.Object3D,
  animations: THREE.AnimationClip[]
): THREE.AnimationMixer | undefined {
  const face = character.getObjectByName("Plane007");
  if (face instanceof THREE.SkinnedMesh) {
    const position = face.geometry.getAttribute("position");

    // The template has no smile morph; these are its mouth's mesh-local coordinates.
    const mouthHeight = 12.63;
    const halfWidth = 0.45;
    const outerEdge = 0.43;
    const cornerLift = 0.1;
    for (let index = 0; index < position.count; index++) {
      const x = Math.abs(position.getX(index));
      const y = position.getY(index);
      const z = position.getZ(index);
      const bend = Math.min(x / halfWidth, 1) ** 2;
      const outerFalloff = Math.exp(-((Math.max(0, x - outerEdge) / 0.18) ** 2));
      const verticalFalloff = Math.exp(-(((y - mouthHeight) / 0.19) ** 2));
      const front = THREE.MathUtils.clamp((z - 0.6) / 0.25, 0, 1);
      position.setY(index, y + cornerLift * bend * outerFalloff * verticalFalloff * front);
    }

    position.needsUpdate = true;
    face.geometry.computeBoundingSphere();
  } else {
    console.warn("Mobile character face mesh not found; retaining its original expression.");
  }

  const browClip = animations.find((clip) => clip.name === "browup");
  const browTracks = browClip?.tracks.filter(
    (track) => track.name.startsWith("eyebrow_L.") || track.name.startsWith("eyebrow_R.")
  );
  if (!browClip || !browTracks?.length) {
    console.warn("Mobile character eyebrow animation not found; retaining its original pose.");
    return;
  }

  const mixer = new THREE.AnimationMixer(character);
  const action = mixer.clipAction(
    new THREE.AnimationClip("mobile-brows", browClip.duration, browTracks)
  );
  action.play();
  mixer.update(0.5);
  return mixer;
}
