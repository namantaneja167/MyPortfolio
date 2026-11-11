import "./styles/About.css";
import { config } from "../config";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        {config.about.paragraphs.map((paragraph) => (
          <p className="para" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default About;
