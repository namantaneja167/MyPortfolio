import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { TextSplitter } from "../src/utils/textSplitter";

let rebuilds = 0;
let observer: MutationObserver | undefined;

export function watchTextRebuilds() {
  observer?.disconnect();
  rebuilds = 0;
  const para = document.querySelector(".about-me .para");
  if (!para) throw new Error("About paragraph is missing");
  // TextSplitter rewrites the paragraph when it splits or reverts, never otherwise.
  observer = new MutationObserver((records) => {
    rebuilds += records.filter((record) => record.target === para).length;
  });
  observer.observe(para, { childList: true });
}

export function readTextRebuilds() {
  return rebuilds;
}

export async function refreshTimes(count: number) {
  for (let i = 0; i < count; i++) {
    ScrollTrigger.refresh();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
}

export function counts() {
  return {
    triggers: ScrollTrigger.getAll().length,
    tweens: gsap.globalTimeline.getChildren(true, true, true).length,
    canvases: document.querySelectorAll("canvas").length,
    splitWords: document.querySelectorAll(".split-word").length,
  };
}

export async function nestedLinesAfterRebuild() {
  const element = document.createElement("div");
  element.textContent = "Text should be split only once after a quick rebuild.";
  document.body.appendChild(element);

  const first = new TextSplitter(element, { type: "lines,words" });
  first.revert();
  const second = new TextSplitter(element, { type: "lines,words" });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const nested = element.querySelectorAll(".split-line .split-line").length;
  second.revert();
  element.remove();
  return nested;
}

const disposals = { geometries: 0, materials: 0 };

export function watchModelDisposals() {
  const disposeGeometry = THREE.BufferGeometry.prototype.dispose;
  const disposeMaterial = THREE.Material.prototype.dispose;
  THREE.BufferGeometry.prototype.dispose = function () {
    disposals.geometries++;
    return disposeGeometry.call(this);
  };
  THREE.Material.prototype.dispose = function () {
    disposals.materials++;
    return disposeMaterial.call(this);
  };
}

export function readModelDisposals() {
  return disposals;
}

let observedHead: THREE.Object3D | undefined;

export function watchCharacterHead() {
  const getObjectByName = THREE.Object3D.prototype.getObjectByName;
  THREE.Object3D.prototype.getObjectByName = function (name) {
    const object = getObjectByName.call(this, name);
    if (name === "spine006" && object) observedHead = object;
    return object;
  };
}

export function characterHeadRotation() {
  return observedHead
    ? [observedHead.rotation.x, observedHead.rotation.y]
    : null;
}
