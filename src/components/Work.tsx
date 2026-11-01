import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { config } from "../config";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = section?.querySelector<HTMLElement>(".work-flex");
    const lastCard = track?.querySelector<HTMLElement>(".work-box:last-child");
    if (!section || !track || !lastCard) return;

    const getTravelDistance = () => {
      // Subtract the current translation so mid-scroll refreshes measure layout.
      const translation = Number(gsap.getProperty(track, "x"));
      return Math.max(
        0,
        lastCard.getBoundingClientRect().right -
          section.getBoundingClientRect().right -
          translation
      );
    };

    const media = gsap.matchMedia();
    media.add(
      "(min-width: 769px) and (height > 650px) and (prefers-reduced-motion: no-preference)",
      (context) => {
        // Let stylesheet and breakpoint layout settle before capturing pin sizes.
        const frame = requestAnimationFrame(() => {
          context.add(() => {
            gsap.fromTo(
              track,
              { x: 0 },
              {
                x: () => -getTravelDistance(),
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top top",
                  end: () => `+=${getTravelDistance()}`,
                  scrub: 1,
                  pin: true,
                  pinSpacing: true,
                  anticipatePin: 1,
                  id: "work",
                  invalidateOnRefresh: true,
                },
              }
            );
          });
          ScrollTrigger.refresh(true);
        });
        return () => cancelAnimationFrame(frame);
      }
    );

    let mounted = true;
    document.fonts.ready.then(() => {
      if (mounted) ScrollTrigger.refresh(true);
    });

    return () => {
      mounted = false;
      media.revert();
    };
  }, []);
  return (
    <div className="work-section" id="work" ref={sectionRef}>
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {config.projects.map((project, index) => (
            <div className="work-box" key={project.id}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Contribution</h4>
                <p>{project.description}</p>
                <h4>Result</h4>
                <p>{project.outcome}</p>
                <h4>Stack</h4>
                <p>{project.technologies}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={project.alt}
                link={project.link}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
