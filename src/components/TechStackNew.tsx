import { useEffect, useRef } from "react";
import "./styles/TechStackNew.css";
import { isMotionPaused, subscribeMotion } from "../utils/motion";
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

// Plays the decorative loop only while it is on screen and motion is allowed.
const BackgroundVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let inView = false;
    const sync = () => {
      if (inView && !isMotionPaused() && !document.hidden) {
        video.play().catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          console.warn("Background video playback failed:", error);
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    const unsubscribe = subscribeMotion(sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      unsubscribe();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);
  return (
    <video ref={videoRef} loop muted playsInline preload="metadata" className="techstack-video">
      <source src={assetUrl("video/video.webm")} type="video/webm" />
    </video>
  );
};

const TechStackNew = () => (
  <div className="techstack-new">
    <div className="techstack-video-container">
      <BackgroundVideo />
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
