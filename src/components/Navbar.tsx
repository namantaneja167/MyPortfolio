import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import Lenis from "lenis";
import "./styles/Navbar.css";
import { config } from "../config";

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;

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
    lenis = scrollController;

    // Start paused
    scrollController.stop();

    const updateLenis = (time: number) => scrollController.raf(time * 1000);
    scrollController.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Handle navigation links
    const links = document.querySelectorAll(".header ul a");
    const handleNavigation = (e: Event) => {
      if (window.innerWidth > 1024) {
        e.preventDefault();
        const elem = e.currentTarget as HTMLAnchorElement;
        const section = elem.getAttribute("data-href");
        if (section) {
          const target = document.querySelector(section) as HTMLElement;
          if (target) {
            scrollController.scrollTo(target, {
              offset: -100,
              duration: 1.5,
            });
          }
        }
      }
    };
    links.forEach((element) => {
      element.addEventListener("click", handleNavigation);
    });

    // Handle resize
    const handleResize = () => scrollController.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(updateLenis);
      scrollController.off("scroll", ScrollTrigger.update);
      window.removeEventListener("resize", handleResize);
      links.forEach((element) => {
        element.removeEventListener("click", handleNavigation);
      });
      scrollController.destroy();
      if (lenis === scrollController) lenis = null;
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
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
