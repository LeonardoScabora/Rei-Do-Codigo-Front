import { useState } from "react";
import type { Usuario } from "../api";
import CrownIcon from "../Components/CrownIcon";
import "./Style.css";
import NewGameScreen from "./Components/NewGameScreen";
import LoadGameScreen from "./Components/LoadGameScreen";
import OptionsScreen from "./Components/OptionsScreen";
import type { DifficultyKey } from "./difficulty";
import type { LanguageKey } from "./language";

type Screen = "menu" | "new" | "load" | "options";

const MENU_ITEMS = [
  { key: "new", label: "Novo Jogo", icon: "sword" },
  { key: "load", label: "Carregar Jogo", icon: "save" },
  { key: "options", label: "Opções", icon: "gear" },
] as const;

type IconName = (typeof MENU_ITEMS)[number]["icon"];

function Icon({ name }: { name: IconName }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" as const };
  if (name === "sword") {
    return (
      <svg
        {...common}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" x2="19" y1="19" y2="13" />
        <line x1="16" x2="20" y1="16" y2="20" />
        <line x1="19" x2="21" y1="21" y2="19" />
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
        <line x1="5" x2="9" y1="14" y2="18" />
        <line x1="7" x2="4" y1="17" y2="20" />
        <line x1="3" x2="5" y1="19" y2="21" />
      </svg>
    );
  }
  if (name === "save") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="1.6" />
        <rect x="7" y="4" width="10" height="6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="8" y="13" width="8" height="6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MainMenu({ onSelect }: { onSelect: (screen: Screen) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className="rk-panel" aria-label="Menu principal">
      {MENU_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`rk-item${hovered === item.key ? " rk-hovered" : ""}`}
          onMouseEnter={() => setHovered(item.key)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onSelect(item.key as Screen)}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

type Props = {
  onConfirmNewGame: (nome: string, lang: LanguageKey, difficulty: DifficultyKey) => void;
  onLoadGame: (usuario: Usuario) => void;
  creating?: boolean;
  createError?: string | null;
};

function Menu({
  onConfirmNewGame,
  onLoadGame,
  creating = false,
  createError = null,
}: Props) {
  const [screen, setScreen] = useState<Screen>("menu");
  const goBack = () => setScreen("menu");

  return (
    <>
      <CrownIcon />
      <h1 className="rk-title">Rei do Código</h1>
      <div className="rk-divider">
        <span className="rk-diamond" />
      </div>

      {screen === "menu" && <MainMenu onSelect={setScreen} />}
      {screen === "new" && (
        <NewGameScreen
          onBack={goBack}
          onConfirm={onConfirmNewGame}
          submitting={creating}
          error={createError}
        />
      )}
      {screen === "load" && (
        <LoadGameScreen onBack={goBack} onLoad={onLoadGame} />
      )}
      {screen === "options" && <OptionsScreen onBack={goBack} />}
    </>
  );
}

export default Menu;
