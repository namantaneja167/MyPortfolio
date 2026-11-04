import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Loading from "../components/Loading";
import { activatePage } from "../utils/pageLifecycle";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
  beginInitialFX: (initialize: () => () => void) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    // The mobile portrait loads progressively without blocking the page.
    if (window.innerWidth <= 1024) return false;
    return true;
  });
  const [loading, setLoading] = useState(0);
  const introCleanup = useRef<(() => void) | null>(null);
  const beginInitialFX = useCallback((initialize: () => () => void) => {
    introCleanup.current?.();
    introCleanup.current = initialize();
  }, []);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
    beginInitialFX,
  };
  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    // Start without waiting for a character on tablet and mobile.
    if (window.innerWidth <= 1024) {
      import("../components/utils/initialFX")
        .then((module) => {
          if (!active) return;
          timer = window.setTimeout(() => {
            if (!active) return;
            try {
              beginInitialFX(module.initialFX);
            } catch (error) {
              console.error("Portfolio intro failed; showing the page without it:", error);
              activatePage();
            }
          }, 100);
        })
        .catch((error: unknown) => {
          if (!active) return;
          console.error("Portfolio intro failed to load; showing the page without it:", error);
          activatePage();
        });
    }
    return () => {
      active = false;
      window.clearTimeout(timer);
      introCleanup.current?.();
      introCleanup.current = null;
    };
  }, [beginInitialFX]);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
