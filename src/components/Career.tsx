import "./styles/Career.css";
import { config } from "../config";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { setAllTimeline } from "./utils/GsapScroll";

const getDisplayPeriod = (period: string) => {
  const years = period.match(/\b20\d{2}\b/g);
  if (!years?.length) return period;
  const endYear = period.includes("Present") ? "NOW" : years[years.length - 1];
  return `${years[0]}–${endYear}`;
};

const Career = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const context = gsap.context(setAllTimeline, sectionRef);
    return () => context.revert();
  }, []);
  return (
    <div className="career-section section-container" ref={sectionRef}>
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {config.experiences.map((exp, index) => (
            <div key={index} className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{exp.position}</h4>
                  <h5>{exp.company}</h5>
                </div>
                <h3>{getDisplayPeriod(exp.period)}</h3>
              </div>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
