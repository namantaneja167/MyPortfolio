import { mobileCharacterPortraitUrl } from "../../config";

const CharacterPortrait = () => (
  <img
    className="character-fallback"
    src={mobileCharacterPortraitUrl}
    alt="Illustrated character portrait"
    width="480"
    height="480"
  />
);

export default CharacterPortrait;
