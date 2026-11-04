import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import setSplitText, { destroySplitText } from "./utils/splitText";
import { useLoading } from "../context/LoadingProvider";
import { mobileCharacterPortraitUrl } from "../config";

const MobileCharacter = lazy(() => import("./Character/MobileCharacter"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  const [shouldRenderCharacter, setShouldRenderCharacter] = useState(false);
  const { setLoading } = useLoading();

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      destroySplitText();
    };
  }, []);

  useEffect(() => {
    // Below the desktop breakpoint nothing waits on the 3D scene, so release
    // a loader started at desktop width before the scene could finish.
    if (!isDesktopView) setLoading(100);
  }, [isDesktopView, setLoading]);

  useEffect(() => {
    if (!isDesktopView) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const mountCharacter = () => setShouldRenderCharacter(true);

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(mountCharacter, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(mountCharacter, 1200);
    }

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && shouldRenderCharacter && children}
      <div className="container-main">
        <Landing>
          {!isDesktopView && (
            <Suspense
              fallback={
                <div className="mobile-character">
                  <img
                    className="mobile-character-portrait"
                    src={mobileCharacterPortraitUrl}
                    alt="Stylised character from the portfolio template"
                    width="480"
                    height="480"
                  />
                </div>
              }
            >
              <MobileCharacter />
            </Suspense>
          )}
        </Landing>
        <About />
        <WhatIDo />
        <Career />
        <Work />
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;
