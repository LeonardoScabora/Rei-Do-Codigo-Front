import { useCallback, useEffect, useRef, useState } from "react";
import {
  buscarUsuario,
  iniciarBatalha,
  listarInimigos,
  type Batalha,
  type Inimigo,
  type ResultadoAcao,
  type Usuario,
} from "../api";
import { labelNivel } from "../Menu/difficulty";
import CodeBattle from "./CodeBattle";
import CorridorScene, { type CorridorMode } from "./CorridorScene";
import DialogueBox from "./DialogueBox";
import QuizBattle from "./QuizBattle";
import type { KnightPose } from "./sprites/KnightSprite";
import type { EnemyPose } from "./sprites/EnemySprite";
import "./Style.css";
import "./Corridor.css";

type Props = {
  usuarioInicial: Usuario;
  onSair: () => void;
  /** Só inicia a caminhada depois da transição da coroa. */
  pronto?: boolean;
};

type Fase =
  | "loading"
  | "walking"
  | "dialogue"
  | "battle"
  | "enemy_fall"
  | "victory_final"
  | "defeat";

const DIALOGO_PADRAO = "Voce nunca passara por mim verme!";
const WALK_MS = 3200;
const HIT_MS = 700;
const FALL_MS = 1400;

export default function GameRoot({ usuarioInicial, onSair, pronto = true }: Props) {
  const [usuario, setUsuario] = useState(usuarioInicial);
  const [inimigos, setInimigos] = useState<Inimigo[]>([]);
  const [fase, setFase] = useState<Fase>("loading");
  const [inimigoAtual, setInimigoAtual] = useState<Inimigo | null>(null);
  const [batalha, setBatalha] = useState<Batalha | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [knightPose, setKnightPose] = useState<KnightPose>("walk");
  const [enemyPose, setEnemyPose] = useState<EnemyPose>("approach");
  const [animandoHit, setAnimandoHit] = useState(false);
  const walkTimer = useRef<number | null>(null);
  const hitTimer = useRef<number | null>(null);

  const limparTimers = useCallback(() => {
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    walkTimer.current = null;
    hitTimer.current = null;
  }, []);

  const iniciarCaminhada = useCallback(
    (lista: Inimigo[], user: Usuario) => {
      limparTimers();
      if (user.venceuRei) {
        setFase("victory_final");
        setKnightPose("idle");
        setInimigoAtual(null);
        return;
      }

      const proximo = lista.find((i) => i.ordemNoCorredor === user.progresso) ?? null;
      setInimigoAtual(proximo);
      setBatalha(null);
      setEnemyPose("approach");
      setKnightPose("walk");
      setFase("walking");

      walkTimer.current = window.setTimeout(() => {
        setKnightPose("idle");
        setEnemyPose("idle");
        setFase("dialogue");
      }, WALK_MS);
    },
    [limparTimers],
  );

  const carregar = useCallback(async () => {
    setErro(null);
    setFase("loading");
    try {
      const [u, lista] = await Promise.all([
        buscarUsuario(usuarioInicial.id),
        listarInimigos(),
      ]);
      setUsuario(u);
      setInimigos(lista);
      iniciarCaminhada(lista, u);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar o corredor.");
      setFase("defeat");
    }
  }, [usuarioInicial.id, iniciarCaminhada]);

  useEffect(() => {
    if (!pronto) return;
    void carregar();
    return limparTimers;
  }, [pronto, carregar, limparTimers]);

  async function comecarBatalha() {
    if (!inimigoAtual) return;
    setErro(null);
    try {
      const b = await iniciarBatalha(usuario.id, inimigoAtual.id);
      setBatalha(b);
      setKnightPose("idle");
      setEnemyPose("idle");
      setFase("battle");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar a batalha.");
    }
  }

  function atualizarBatalha(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    setBatalha((atual) => (atual ? { ...atual, ...parcial } : atual));
    setAnimandoHit(true);

    if (resultado.acertou) {
      setKnightPose("attack");
      setEnemyPose("hurt");
    } else {
      setEnemyPose("attack");
      setKnightPose("hurt");
    }

    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    hitTimer.current = window.setTimeout(() => {
      setAnimandoHit(false);

      if (resultado.status === "VITORIA") {
        setKnightPose("idle");
        setEnemyPose("fall");
        setFase("enemy_fall");
        window.setTimeout(() => void aposVitoria(), FALL_MS);
        return;
      }

      if (resultado.status === "DERROTA") {
        setKnightPose("defeat");
        setEnemyPose("idle");
        setFase("defeat");
        return;
      }

      setKnightPose("idle");
      setEnemyPose("idle");
    }, HIT_MS);
  }

  async function aposVitoria() {
    try {
      const u = await buscarUsuario(usuario.id);
      setUsuario(u);
      if (u.venceuRei) {
        setFase("victory_final");
        setKnightPose("idle");
        setInimigoAtual(null);
        return;
      }
      iniciarCaminhada(inimigos, u);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao avançar no corredor.");
      setFase("defeat");
    }
  }

  const mode: CorridorMode =
    fase === "walking"
      ? "walking"
      : fase === "dialogue"
        ? "dialogue"
        : fase === "battle"
          ? "battle"
          : fase === "enemy_fall"
            ? "enemy_fall"
            : "ended";

  const scrolling = fase === "walking";
  const enemyVisible =
    Boolean(inimigoAtual) &&
    (fase === "walking" ||
      fase === "dialogue" ||
      fase === "battle" ||
      fase === "enemy_fall");
  const emBatalha = fase === "battle" && batalha;
  const painelDireito = emBatalha || fase === "enemy_fall";

  return (
    <div className={`rk-game-root${painelDireito ? " rk-game-root--split" : ""}`}>
      <div className="rk-game-toolbar">
        <button type="button" className="rk-back-btn" onClick={onSair}>
          ‹ Menu
        </button>
        <span className="rk-game-toolbar__meta">
          {usuario.nome} · {usuario.linguagem} · {labelNivel(usuario.nivel)} · sala{" "}
          {usuario.progresso}
        </span>
      </div>

      {erro && <p className="rk-error rk-game-error">{erro}</p>}

      {fase === "loading" && <p className="rk-hint">Entrando no Corredor Real...</p>}

      <div className="rk-game-body">
        <div className="rk-game-stage">
          <CorridorScene
            mode={mode}
            scrolling={scrolling}
            inimigo={inimigoAtual}
            enemyVisible={enemyVisible}
            knightPose={knightPose}
            enemyPose={enemyPose}
            vidaJogador={batalha?.vidaJogador}
            vidaInimigo={batalha?.vidaInimigo}
            compact={Boolean(painelDireito)}
          />

          {fase === "dialogue" && inimigoAtual && (
            <DialogueBox
              speaker={inimigoAtual.nome}
              text={DIALOGO_PADRAO}
              onContinue={() => void comecarBatalha()}
            />
          )}

          {fase === "victory_final" && (
            <div className="rk-overlay-card">
              <p className="rk-feedback rk-ok">Você derrotou o Rei e se tornou o Rei do Código!</p>
              <button type="button" className="rk-back-btn rk-confirm-btn" onClick={onSair}>
                ‹ Voltar ao Menu
              </button>
            </div>
          )}

          {fase === "defeat" && (
            <div className="rk-overlay-card">
              <p className="rk-error">Você foi derrotado no Corredor Real.</p>
              <div className="rk-actions">
                <button type="button" className="rk-back-btn" onClick={onSair}>
                  ‹ Menu
                </button>
                <button
                  type="button"
                  className="rk-back-btn rk-confirm-btn"
                  onClick={() => void carregar()}
                >
                  Tentar de novo ›
                </button>
              </div>
            </div>
          )}
        </div>

        {painelDireito && batalha && inimigoAtual && (
          <aside className="rk-game-side">
            {batalha.tipoInimigo === "MULTIPLA_ESCOLHA" ? (
              <QuizBattle
                batalha={batalha}
                onAtualizarBatalha={atualizarBatalha}
                disabled={animandoHit || fase !== "battle"}
              />
            ) : (
              <CodeBattle
                batalha={batalha}
                linguagem={usuario.linguagem}
                onAtualizarBatalha={atualizarBatalha}
                disabled={animandoHit || fase !== "battle"}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
