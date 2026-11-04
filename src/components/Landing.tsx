import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          {children}
          <div className="landing-info">
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{config.developer.title}</div>
            </h2>
            <h2 className="landing-info-secondary">
              <div className="landing-h2-info">
                {config.developer.secondaryFocus}
              </div>
            </h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
