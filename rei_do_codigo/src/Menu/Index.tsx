import { useRef, useState } from "react";
import "./Style.css";
import { useMatrixRain } from "../Components/MatrixRain";
import NewGameScreen from "./Components/NewGameScreen";
import LoadGameScreen from "./Components/LoadGameScreen";
import OptionsScreen from "./Components/OptionsScreen";

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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="72" height="52" viewBox="0 0 72 52" fill="none" className="rk-crown">
      <path
        d="M6 44 L2 16 L16 28 L24 8 L36 24 L48 8 L56 28 L70 16 L66 44 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
        fill="rgba(80,255,140,0.08)"
      />
      <rect x="6" y="44" width="60" height="5" stroke="currentColor" strokeWidth="3" fill="rgba(80,255,140,0.08)" />
      <circle cx="36" cy="18" r="2.4" fill="currentColor" />
      <circle cx="20" cy="26" r="1.8" fill="currentColor" />
      <circle cx="52" cy="26" r="1.8" fill="currentColor" />
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

function Menu() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<Screen>("menu");
  useMatrixRain(canvasRef);

  const goBack = () => setScreen("menu");

  return (
    <div className="rk-root">
      {/* Background, canvas e vignette ficam FORA da troca de tela — nunca são desmontados */}
      <div className="rk-bg" />
      <canvas ref={canvasRef} className="rk-canvas" />
      <div className="rk-vignette" />

      <div className="rk-content">
        <CrownIcon />
        <h1 className="rk-title">Rei do Código</h1>
        <div className="rk-divider">
          <span className="rk-diamond" />
        </div>

        {screen === "menu" && <MainMenu onSelect={setScreen} />}
        {screen === "new" && (
          <NewGameScreen
            onBack={goBack}
            onSelectLanguage={(lang) => {
              // TODO: iniciar o jogo com a linguagem escolhida
              console.log("Novo jogo iniciado:", lang);
            }}
          />
        )}
        {screen === "load" && <LoadGameScreen onBack={goBack} />}
        {screen === "options" && <OptionsScreen onBack={goBack} />}
      </div>
    </div>
  );
}

export default Menu;