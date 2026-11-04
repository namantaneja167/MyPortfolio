import {
  FaGithub,
  FaLinkedinIn,
  FaMedium,
  FaXTwitter,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect, useState } from "react";
import HoverLinks from "./HoverLinks";
import { config } from "../config";
import { isMotionPaused, subscribeMotion } from "../utils/motion";

const SocialIcons = () => {
  const [isHeroVisible, setIsHeroVisible] = useState(
    () => !window.location.hash || window.location.hash === "#"
  );

  useEffect(() => {
    const hero = document.getElementById("landingDiv");
    if (!hero || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHeroVisible) return;
    const social = document.getElementById("social");
    if (!social) return;
    const cleanups: (() => void)[] = [];
    const resetters: (() => void)[] = [];

    social.querySelectorAll("span").forEach((elem) => {
      const link = elem.querySelector("a");
      if (!link) return;

      let rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = mouseX;
      let currentY = mouseY;
      let frame: number | undefined;

      const paint = () => {
        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);
      };
      const reset = () => {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        rect = elem.getBoundingClientRect();
        mouseX = currentX = rect.width / 2;
        mouseY = currentY = rect.height / 2;
        paint();
      };
      // Eases toward the pointer and stops once settled.
      const updatePosition = () => {
        frame = undefined;
        if (isMotionPaused()) {
          currentX = mouseX;
          currentY = mouseY;
          paint();
          return;
        }
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        paint();
        if (Math.abs(mouseX - currentX) > 0.1 || Math.abs(mouseY - currentY) > 0.1) {
          frame = requestAnimationFrame(updatePosition);
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        if (isMotionPaused() || document.hidden || !elem.getClientRects().length) return;
        rect = elem.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const inside = x < 40 && x > 10 && y < 40 && y > 5;
        const nextX = inside ? x : rect.width / 2;
        const nextY = inside ? y : rect.height / 2;
        if (nextX === mouseX && nextY === mouseY) return;
        mouseX = nextX;
        mouseY = nextY;
        if (frame === undefined) frame = requestAnimationFrame(updatePosition);
      };

      paint();
      resetters.push(reset);
      document.addEventListener("mousemove", onMouseMove);
      cleanups.push(() => {
        document.removeEventListener("mousemove", onMouseMove);
        if (frame !== undefined) cancelAnimationFrame(frame);
      });
    });

    const syncMotion = () => {
      if (isMotionPaused() || document.hidden) resetters.forEach((reset) => reset());
    };
    const unsubscribe = subscribeMotion(syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", syncMotion);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [isHeroVisible]);

  return (
    <div
      className={`icons-section${isHeroVisible ? " is-hero-visible" : ""}`}
      aria-label="Quick links"
    >
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href={config.contact.github} target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer">
            <FaXTwitter />
          </a>
        </span>
        <span>
          <a href={config.contact.medium} target="_blank" rel="noopener noreferrer">
            <FaMedium />
          </a>
        </span>
      </div>
      <a className="resume-button" href={config.resume} target="_blank" rel="noreferrer">
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
