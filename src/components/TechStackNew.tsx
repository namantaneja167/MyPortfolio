import "./styles/TechStackNew.css";
import { assetUrl } from "../config";
import type { IconType } from "react-icons";
import {
  SiAzurefunctions,
  SiAzurepipelines,
  SiCsharp,
  SiDataiku,
  SiDbt,
  SiMicrosoftazure,
  SiPython,
  SiSnowflake,
  SiTableau,
} from "react-icons/si";
import { TbDatabase } from "react-icons/tb";

interface TechItem {
  name: string;
  icon: IconType;
  url?: string;
}

const techStack: TechItem[] = [
  { name: "Python", icon: SiPython, url: "https://python.org" },
  { name: "Snowflake", icon: SiSnowflake, url: "https://www.snowflake.com" },
  { name: "Azure", icon: SiMicrosoftazure, url: "https://azure.microsoft.com" },
  {
    name: "C#",
    icon: SiCsharp,
    url: "https://learn.microsoft.com/dotnet/csharp",
  },
  { name: "dbt", icon: SiDbt, url: "https://www.getdbt.com" },
  {
    name: "Snowpipe",
    icon: SiSnowflake,
    url: "https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro",
  },
  {
    name: "Azure Data Factory",
    icon: SiAzurepipelines,
    url: "https://azure.microsoft.com/products/data-factory",
  },
  {
    name: "Azure Functions",
    icon: SiAzurefunctions,
    url: "https://azure.microsoft.com/products/functions",
  },
  {
    name: "Dataiku DSS",
    icon: SiDataiku,
    url: "https://www.dataiku.com/product/",
  },
  { name: "Tableau", icon: SiTableau, url: "https://www.tableau.com" },
  { name: "SQL", icon: TbDatabase },
];

const TechStackNew = () => (
  <div className="techstack-new">
    <div className="techstack-video-container">
      <video autoPlay loop muted playsInline className="techstack-video">
        <source src={assetUrl("video/video.webm")} type="video/webm" />
      </video>
      <div className="techstack-overlay"></div>
    </div>
    <div className="techstack-content">
      <h2>Technologies I work with</h2>
      <div className="techstack-pyramid">
        {techStack.map((tech) => {
          const Icon = tech.icon;
          const content = (
            <>
              <Icon className="techstack-icon" aria-hidden="true" />
              <span>{tech.name}</span>
            </>
          );
          return tech.url ? (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="techstack-item"
              data-cursor="disable"
            >
              {content}
            </a>
          ) : (
            <div key={tech.name} className="techstack-item">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default TechStackNew;
