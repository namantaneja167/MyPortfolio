import { lazy, Suspense, useEffect, type ComponentType } from "react";
import "./App.css";
import { LoadingProvider, useLoading } from "./context/LoadingProvider";

// A failed scene chunk must not strand the loader; the page stays usable without it.
const CharacterUnavailable = () => {
  const { setLoading } = useLoading();
  useEffect(() => setLoading(100), [setLoading]);
  return null;
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
