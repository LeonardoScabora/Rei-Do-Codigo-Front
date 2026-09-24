import { useState } from "react";
import type { Usuario } from "../api";
import "./Style.css";
import NewGameScreen from "./Components/NewGameScreen";
import LoadGameScreen from "./Components/LoadGameScreen";
import { MenuBanner, MenuFrame } from "./Components/MenuChrome";
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

function MenuCrown() {
  return (
    <svg className="rk-crown" width="86" height="54" viewBox="0 0 86 54" aria-hidden>
      <path
        fill="currentColor"
        d="M8 42 5 16l16 12L32 6l11 18L54 6l11 22 16-12-3 26H8z"
      />
      <path fill="currentColor" d="M8 42h70v8H8z" />
      <circle cx="43" cy="22" r="2.3" fill="#042010" />
      <circle cx="24" cy="30" r="1.7" fill="#042010" />
      <circle cx="62" cy="30" r="1.7" fill="#042010" />
    </svg>
  );
}

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "sword") {
    return (
      <svg {...common}>
        <path d="M6.2 4.2 16.8 14.8" />
        <path d="M4.4 6.4 6.6 4.2 8.2 5.8 6 8" />
        <path d="M15.2 16.6 17.6 19" />
        <path d="M16.4 20.2 19.2 17.4 20.6 18.8 17.8 21.6z" fill="currentColor" />
        <path d="M17.8 4.2 7.2 14.8" />
        <path d="M19.6 6.4 17.4 4.2 15.8 5.8 18 8" />
        <path d="M8.8 16.6 6.4 19" />
        <path d="M7.6 20.2 4.8 17.4 3.4 18.8 6.2 21.6z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "save") {
    return (
      <svg {...common}>
        <path d="M5 3h11l4 4v14H5V3z" />
        <path d="M8 3.5v5h7v-5" />
        <path d="M8 14h8v6H8z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    </svg>
  );
}

function MainMenu({ onSelect }: { onSelect: (screen: Screen) => void }) {
  return (
    <MenuFrame label="Menu principal" nav>
      {MENU_ITEMS.map((item) => (
        <MenuBanner
          key={item.key}
          icon={<Icon name={item.icon} />}
          onClick={() => onSelect(item.key as Screen)}
        >
          {item.label}
        </MenuBanner>
      ))}
    </MenuFrame>
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
  const [nomeGuerreiro, setNomeGuerreiro] = useState<string | null>(null);

  const goBack = () => {
    setNomeGuerreiro(null);
    setScreen("menu");
  };

  const abrirTela = (proxima: Screen) => {
    setNomeGuerreiro(null);
    setScreen(proxima);
  };

  // Save já vencido: nova jornada reaproveitando o nome do guerreiro,
  // pulando a etapa de inserção do nome.
  const handleLoad = (usuario: Usuario) => {
    if (usuario.venceuRei) {
      setNomeGuerreiro(usuario.nome);
      setScreen("new");
      return;
    }
    onLoadGame(usuario);
  };

  return (
    <>
      <header className="rk-masthead">
        <div className="rk-crest">
          <span className="rk-crest__arm" aria-hidden>
            <i className="rk-crest__gem" />
          </span>
          <MenuCrown />
          <span className="rk-crest__arm rk-crest__arm--mirror" aria-hidden>
            <i className="rk-crest__gem" />
          </span>
        </div>
        <h1 className="rk-title">Rei do Código</h1>
        <span className="rk-title-gem" aria-hidden />
      </header>

      {screen === "menu" && <MainMenu onSelect={abrirTela} />}
      {screen === "new" && (
        <NewGameScreen
          onBack={goBack}
          onConfirm={onConfirmNewGame}
          submitting={creating}
          error={createError}
          nomeInicial={nomeGuerreiro}
        />
      )}
      {screen === "load" && (
        <LoadGameScreen onBack={goBack} onLoad={handleLoad} />
      )}
      {screen === "options" && <OptionsScreen onBack={goBack} />}
    </>
  );
}

export default Menu;
