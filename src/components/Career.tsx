import "./styles/Career.css";
import { config } from "../config";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { setAllTimeline } from "./utils/GsapScroll";

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
                <h3>{exp.period}</h3>
              </div>
              <div className="career-summary">
                <p>{exp.description}</p>
                <ul>
                  {exp.responsibilities.map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
