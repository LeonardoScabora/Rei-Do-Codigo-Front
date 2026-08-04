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
      <svg {...common}>
        <path
          d="M20 3L11 12M20 3l-3 1-1 3M20 3l1 3-3 1M11 12l-6.5 6.5M11 12l1.5 1.5M4.5 18.5L3 20l1.5-.5.5-1.5-1-1z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
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
    <svg {...common}>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
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