import { useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import { assetUrl } from "../config";

interface Props {
  image: string;
  alt?: string;
  video?: string;
  link?: string;
}

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");
  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  return (
    <div className="work-image">
      {props.link ? (
        <a
          className="work-image-in"
          href={props.link.startsWith("/") ? assetUrl(props.link) : props.link}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsVideo(false)}
          target={props.link.startsWith("/") ? undefined : "_blank"}
          rel={props.link.startsWith("/") ? undefined : "noopener noreferrer"}
          data-cursor={"disable"}
        >
          <div className="work-link">
            <MdArrowOutward />
          </div>
          <img src={props.image} alt={props.alt} loading="lazy" decoding="async" />
          {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
        </a>
      ) : (
        <div
          className="work-image-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsVideo(false)}
          data-cursor={"disable"}
        >
          <img src={props.image} alt={props.alt} loading="lazy" decoding="async" />
          {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
        </div>
      )}
    </div>
  );
};

export default WorkImage;
