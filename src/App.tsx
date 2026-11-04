import { lazy, Suspense, useEffect, type ComponentType } from "react";
import "./App.css";
import { LoadingProvider, useLoading } from "./context/LoadingProvider";
import CharacterPortrait from "./components/Character/CharacterPortrait";

// A failed scene chunk must not strand the loader; the page stays usable without it.
const CharacterUnavailable = () => {
  const { setLoading } = useLoading();
  useEffect(() => setLoading(100), [setLoading]);
  return (
    <div className="character-container">
      <div className="character-model character-model-fallback" data-graphics="fallback">
        <div className="character-rim"></div>
        <CharacterPortrait />
      </div>
    </div>
  );
};

const CharacterModel = lazy<ComponentType>(() =>
  import("./components/Character").catch((error: unknown) => {
    console.error("Desktop character code failed to load:", error);
    return { default: CharacterUnavailable };
  })
);
const MainContainer = lazy(() => import("./components/MainContainer"));

const App = () => {
  return (
    <>
      <LoadingProvider>
        <Suspense>
          <MainContainer>
            <Suspense>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
