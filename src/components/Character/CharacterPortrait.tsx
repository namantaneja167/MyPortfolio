import { mobileCharacterPortraitUrl } from "../../config";

const CharacterPortrait = () => (
  <img
    className="character-fallback"
    src={mobileCharacterPortraitUrl}
    alt="Stylised character from the portfolio template"
    width="480"
    height="480"
  />
);

export default CharacterPortrait;
