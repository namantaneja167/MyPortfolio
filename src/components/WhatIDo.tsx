import "./styles/WhatIDo.css";
import { config } from "../config";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenis } from "./Navbar";

function handleToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
  const details = event.currentTarget;
  if (details.open) {
    details
      .closest(".what-box-in")
      ?.querySelectorAll<HTMLDetailsElement>("details[open]")
      .forEach((other) => {
        if (other !== details) other.open = false;
      });
  }
  // Desktop reserves room for one open card, so the layout is stable and a
  // refresh would only replay the character timeline mid-scroll.
  if (window.matchMedia("(min-width: 1025px)").matches) return;
  lenis?.resize();
  ScrollTrigger.refresh();
}

const WhatIDo = () => (
  <div className="whatIDO">
    <div className="what-box">
      <h2 className="title">
        W<span className="hat-h2">HAT</span>
        <div>
          &nbsp;I<span className="do-h2"> DO</span>
        </div>
      </h2>
    </div>
    <div className="what-box">
      <div className="what-box-in">
        {[config.skills.develop, config.skills.design].map((skill) => (
          <details className="what-content" key={skill.title} onToggle={handleToggle}>
            <summary className="what-summary" data-cursor="disable">
              <h3>{skill.title}</h3>
              <h4>{skill.description}</h4>
              <span className="what-arrow" aria-hidden="true"></span>
            </summary>
            <div className="what-content-in">
              <p>{skill.details}</p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {skill.tools.map((tool) => (
                  <div key={tool} className="what-tags">{tool}</div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  </div>
);

export default WhatIDo;
