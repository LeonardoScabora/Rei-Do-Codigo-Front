import { useCallback, useEffect, useState } from "react";
import { criarUsuario, type Usuario } from "./api";
import { pauseMenuMusic, playMenuMusic } from "./audio/music";
import { MatrixRain } from "./Components/MatrixRain";
import CrownTransition from "./game/CrownTransition";
import GameRoot from "./game/GameRoot";
import "./game/Style.css";
import { toApiNivel, type DifficultyKey } from "./Menu/difficulty";
import Menu from "./Menu/Index";
import { toApiLinguagem, type LanguageKey } from "./Menu/language";
import "./Menu/Style.css";

type AppScreen = "menu" | "game";

const STORAGE_KEY = "reidocodigo.usuarioId";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [crownActive, setCrownActive] = useState(false);
  const [crownSceneReady, setCrownSceneReady] = useState(false);

  useEffect(() => {
    if (screen === "menu") {
      playMenuMusic();
    } else {
      pauseMenuMusic();
    }
  }, [screen]);

  function entrarNoJogo(u: Usuario) {
    localStorage.setItem(STORAGE_KEY, String(u.id));
    setUsuario(u);
    setCrownSceneReady(false);
    setScreen("game");
    setCrownActive(true);
  }

  async function handleNovoJogo(nome: string, lang: LanguageKey, difficulty: DifficultyKey) {
    setCreating(true);
    setCreateError(null);
    try {
      const u = await criarUsuario(nome, toApiLinguagem(lang), toApiNivel(difficulty));
      entrarNoJogo(u);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Não foi possível criar o usuário.");
    } finally {
      setCreating(false);
    }
  }

  function handleCarregarJogo(u: Usuario) {
    setCreateError(null);
    entrarNoJogo(u);
  }

  const handleCrownDone = useCallback(() => {
    setCrownActive(false);
    setCrownSceneReady(false);
  }, []);

  const handleSceneReady = useCallback(() => {
    setCrownSceneReady(true);
  }, []);

  function handleSair() {
    setScreen("menu");
    setUsuario(null);
    setCreateError(null);
    setCrownActive(false);
    setCrownSceneReady(false);
  }

  return (
    <div className="rk-root">
      {screen === "menu" && (
        <>
          <div className="rk-bg" />
          <MatrixRain className="rk-canvas" />
          <div className="rk-vignette" />
          <div className="rk-content">
            <Menu
              onConfirmNewGame={handleNovoJogo}
              onLoadGame={handleCarregarJogo}
              creating={creating}
              createError={createError}
            />
          </div>
        </>
      )}

      {screen === "game" && usuario && (
        <GameRoot
          usuarioInicial={usuario}
          onSair={handleSair}
          pronto={!crownActive}
          onSceneReady={handleSceneReady}
        />
      )}

      <CrownTransition
        active={crownActive}
        sceneReady={crownSceneReady}
        onDone={handleCrownDone}
      />
    </div>
  );
}
