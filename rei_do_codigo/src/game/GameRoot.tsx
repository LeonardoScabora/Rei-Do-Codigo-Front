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
import { labelLinguagem } from "../Menu/language";
import CrownIcon from "../Components/CrownIcon";
import CodeBattle from "./CodeBattle";
import CorridorScene, { type CorridorMode } from "./CorridorScene";
import DialogueBox from "./DialogueBox";
import QuizBattle from "./QuizBattle";
import { KNIGHT_ANIM_MS, type KnightPose } from "./sprites/KnightSprite";
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
const FALL_MS = 1400;
const ATTACK_MS = KNIGHT_ANIM_MS.attack;
const ATTACK_BLAST_MS = KNIGHT_ANIM_MS.attackBlast;
const HURT_MS = KNIGHT_ANIM_MS.hurt;

function FlameIcon() {
  return (
    <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden className="rk-flame-icon">
      <path
        d="M8 0 L10 4 L13 3 L12 8 L16 10 L12 13 L13 19 L8 16 L3 19 L4 13 L0 10 L4 8 L3 3 L6 4 Z"
        fill="#ff8a2a"
      />
      <path d="M8 6 L10 9 L8 14 L6 9 Z" fill="#ffd76a" />
    </svg>
  );
}

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
  const [energyBlast, setEnergyBlast] = useState(false);
  const [sequencia, setSequencia] = useState(0);
  const walkTimer = useRef<number | null>(null);
  const hitTimer = useRef<number | null>(null);
  const attackEndTimer = useRef<number | null>(null);
  const pendingHitRef = useRef<{ parcial: Partial<Batalha>; resultado: ResultadoAcao } | null>(null);

  const limparTimers = useCallback(() => {
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    if (attackEndTimer.current) window.clearTimeout(attackEndTimer.current);
    walkTimer.current = null;
    hitTimer.current = null;
    attackEndTimer.current = null;
    pendingHitRef.current = null;
    setEnergyBlast(false);
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

  function finalizarAposAnimacao(resultado: ResultadoAcao) {
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
  }

  const resolverImpactoEnergia = useCallback(() => {
    const pending = pendingHitRef.current;
    if (!pending) return;

    pendingHitRef.current = null;
    setEnergyBlast(false);
    setBatalha((atual) => (atual ? { ...atual, ...pending.parcial } : atual));
    setEnemyPose("hurt");

    hitTimer.current = window.setTimeout(() => {
      finalizarAposAnimacao(pending.resultado);
    }, HURT_MS);
  }, []);

  function atualizarBatalha(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    setSequencia((s) => (resultado.acertou ? s + 1 : 0));
    setAnimandoHit(true);

    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    if (attackEndTimer.current) window.clearTimeout(attackEndTimer.current);
    pendingHitRef.current = null;
    setEnergyBlast(false);

    if (resultado.acertou) {
      // Rajada sai no frame do golpe; idle só quando o sprite de ataque termina.
      setKnightPose("attack");
      setEnemyPose("idle");

      hitTimer.current = window.setTimeout(() => {
        pendingHitRef.current = { parcial, resultado };
        setEnergyBlast(true);
      }, ATTACK_BLAST_MS);

      attackEndTimer.current = window.setTimeout(() => {
        setKnightPose("idle");
      }, ATTACK_MS);
      return;
    }

    // Errou: perde vida + Hurt, depois Idle.
    setBatalha((atual) => (atual ? { ...atual, ...parcial } : atual));
    setEnemyPose("attack");
    setKnightPose("hurt");

    hitTimer.current = window.setTimeout(() => {
      finalizarAposAnimacao(resultado);
    }, HURT_MS);
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
  const salas = [...inimigos].sort((a, b) => a.ordemNoCorredor - b.ordemNoCorredor);
  const vidaAtual = batalha?.vidaJogador ?? 3;

  return (
    <div className={`rk-game-root${painelDireito ? " rk-game-root--split" : ""}`}>
      <header className="rk-game-header">
        <button type="button" className="rk-menu-btn" onClick={onSair}>
          <span className="rk-menu-btn__icon" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          Menu
        </button>

        <div className="rk-game-header__title">
          <CrownIcon className="rk-game-header__crown" width={36} height={26} />
          <h1 className="rk-game-header__name">Corredor Real</h1>
          <span className="rk-level-banner">Nível {usuario.progresso}</span>
        </div>

        <div className="rk-game-header__meta">
          <span>{usuario.nome}</span>
          <i aria-hidden>·</i>
          <span>{labelLinguagem(usuario.linguagem)}</span>
          <i aria-hidden>·</i>
          <span>Sala {usuario.progresso}</span>
        </div>
      </header>

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
            energyBlast={energyBlast}
            onEnergyBlastHit={resolverImpactoEnergia}
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
                totalPerguntas={inimigoAtual.vidaMaxima}
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

      <footer className="rk-game-footer">
        <div className="rk-footer-block">
          <span className="rk-footer-block__label">Status</span>
          <span className="rk-footer-status">
            <span className="rk-footer-status__heart" aria-hidden>
              ♥
            </span>
            {vidaAtual}/3
          </span>
        </div>

        <div className="rk-footer-block rk-footer-block--progress">
          <span className="rk-footer-block__label">Progresso</span>
          <div
            className="rk-progress-track"
            role="img"
            aria-label={`Sala ${usuario.progresso} de ${salas.length}`}
          >
            {salas.map((sala, i) => {
              const vencida = usuario.progresso > sala.ordemNoCorredor;
              const atual = usuario.progresso === sala.ordemNoCorredor;
              const classe = `rk-progress-step${vencida ? " rk-progress-step--done" : ""}${
                atual ? " rk-progress-step--current" : ""
              }`;
              return (
                <span key={sala.id} className="rk-progress-seg">
                  {i > 0 && <span className="rk-progress-line" aria-hidden />}
                  {sala.ehRei ? (
                    <span className={`${classe} rk-progress-step--boss`} aria-hidden>
                      <CrownIcon width={22} height={16} className="rk-progress-crown" />
                    </span>
                  ) : (
                    <span className={classe} aria-hidden />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div className="rk-footer-block">
          <span className="rk-footer-block__label">Sequência</span>
          <span className="rk-footer-streak">
            <FlameIcon />
            {sequencia}
          </span>
        </div>
      </footer>
    </div>
  );
}
