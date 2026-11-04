import { useEffect, useSyncExternalStore } from "react";
import { TbPlayerPauseFilled, TbPlayerPlayFilled } from "react-icons/tb";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./styles/Navbar.css";
import { config } from "../config";
import {
  isUserMotionPaused,
  prefersReducedMotion,
  setUserMotionPaused,
  subscribeMotion,
} from "../utils/motion";
import { lenis, setLenis } from "../utils/pageLifecycle";

gsap.registerPlugin(ScrollTrigger);
export { lenis } from "../utils/pageLifecycle";

const getSectionTarget = (hash: string) => {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

const focusSection = (target: HTMLElement) => {
  if (!target.matches("a, button, input, select, textarea, [tabindex]")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
};

const MotionToggle = () => {
  const paused = useSyncExternalStore(subscribeMotion, isUserMotionPaused);
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion);
  // The OS preference already stops this motion, so the toggle would do nothing.
  if (reduced) return null;
  return (
    <li>
      <button
        type="button"
        className="motion-toggle"
        aria-pressed={paused}
        aria-label={paused ? "Play animations" : "Pause animations"}
        title={paused ? "Play animations" : "Pause animations"}
        data-cursor="disable"
        onClick={() => setUserMotionPaused(!paused)}
      >
        {paused ? <TbPlayerPlayFilled aria-hidden="true" /> : <TbPlayerPauseFilled aria-hidden="true" />}
      </button>
    </li>
  );
};

const Navbar = () => {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const scrollController = new Lenis({
      duration: 1.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.7,
      touchMultiplier: 2,
      infinite: false,
    });
    setLenis(scrollController);

    // The page can become ready before this component finishes loading.
    if (document.querySelector("main.main-active")) scrollController.start();
    else scrollController.stop();

    const updateLenis = (time: number) => scrollController.raf(time * 1000);
    scrollController.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Smooth-scroll section links on desktop while keeping URL, history and focus in sync.
    const scrollToSection = (target: HTMLElement, onComplete?: () => void) => {
      scrollController.scrollTo(target, {
        offset: -100,
        duration: 1.5,
        immediate: prefersReducedMotion(),
        onComplete,
      });
    };
    const links = document.querySelectorAll<HTMLAnchorElement>(".header ul a[data-href]");
    const handleNavigation = (e: MouseEvent) => {
      if (window.innerWidth <= 1024) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const hash = (e.currentTarget as HTMLAnchorElement).getAttribute("data-href") ?? "";
      const target = getSectionTarget(hash);
      if (!target) return;
      e.preventDefault();
      if (window.location.hash !== hash) history.pushState(null, "", hash);
      scrollToSection(target, () => focusSection(target));
    };
    links.forEach((element) => {
      element.addEventListener("click", handleNavigation);
    });
    const handleHistory = () => {
      if (window.innerWidth <= 1024) return;
      const target = getSectionTarget(window.location.hash);
      if (target) scrollToSection(target, () => focusSection(target));
      else if (!window.location.hash) scrollController.scrollTo(0, { immediate: prefersReducedMotion() });
    };
    window.addEventListener("popstate", handleHistory);

    // Handle resize
    const handleResize = () => scrollController.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(updateLenis);
      scrollController.off("scroll", ScrollTrigger.update);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("popstate", handleHistory);
      links.forEach((element) => {
        element.removeEventListener("click", handleNavigation);
      });
      scrollController.destroy();
      if (lenis === scrollController) setLenis(null);
    };
  }, []);
  return (
    <>
      <div className="header">
        <a href={`${import.meta.env.BASE_URL}#`} className="navbar-title" data-cursor="disable">
          NT
        </a>
        <a
          href={`mailto:${config.contact.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {config.contact.email}
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
          <MotionToggle />
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
