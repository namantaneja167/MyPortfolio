import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";
import { isMotionPaused, subscribeMotion } from "../utils/motion";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    let hover = false;
    let frame: number | undefined;
    let still = isMotionPaused();
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    const moveTo = (x: number, y: number) => {
      if (still) gsap.set(cursor, { x, y });
      else gsap.to(cursor, { x, y, duration: 0.1, overwrite: "auto" });
    };

    // Runs only while the cursor is catching up, then sleeps until the next move.
    const loop = () => {
      frame = undefined;
      if (hover) return;
      const dx = mousePos.x - cursorPos.x;
      const dy = mousePos.y - cursorPos.y;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;
      cursorPos.x += dx / 6;
      cursorPos.y += dy / 6;
      moveTo(cursorPos.x, cursorPos.y);
      frame = requestAnimationFrame(loop);
    };
    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      if (hover) return;
      if (still) {
        cursorPos.x = mousePos.x;
        cursorPos.y = mousePos.y;
        moveTo(cursorPos.x, cursorPos.y);
      } else if (frame === undefined) {
        frame = requestAnimationFrame(loop);
      }
    };
    const unsubscribe = subscribeMotion(() => (still = isMotionPaused()));
    document.addEventListener("mousemove", onMouseMove);

    const removers: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((element) => {
      const onOver = () => {
        const rect = element.getBoundingClientRect();
        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          moveTo(rect.left, rect.top);
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };
      const onOut = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
        if (frame === undefined) frame = requestAnimationFrame(loop);
      };
      element.addEventListener("mouseover", onOver);
      element.addEventListener("mouseout", onOut);
      removers.push(() => {
        element.removeEventListener("mouseover", onOver);
        element.removeEventListener("mouseout", onOut);
      });
    });

    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      unsubscribe();
      document.removeEventListener("mousemove", onMouseMove);
      removers.forEach((remove) => remove());
      gsap.killTweensOf(cursor);
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
