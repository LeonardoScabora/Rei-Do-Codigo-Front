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
import CorridorScene, { type ArenaKind, type CorridorMode, type EnemyMovePhase } from "./CorridorScene";
import CrownTransition from "./CrownTransition";
import DialogueBox from "./DialogueBox";
import QuizBattle from "./QuizBattle";
import { KNIGHT_ANIM_MS, type KnightPose } from "./sprites/KnightSprite";
import { GOBLIN_ANIM_MS, GOBLIN_ATTACK_HIT_MS, SKELETON_ANIM_MS, SKELETON_ATTACK_HIT_MS, ENEMY_KNIGHT_ANIM_MS, ENEMY_KNIGHT_ATTACK_HIT_MS, MAGE_ANIM_MS, MAGE_ATTACK_SHOT_MS, KING_ANIM_MS, KING_ATTACK_HIT_MS, type EnemyPose } from "./sprites/EnemySprite";
import type { KingAttackVariant } from "./sprites/KingSprite";
import {
  isCavaleiroInimigo,
  isEsqueletoInimigo,
  isGoblinInimigo,
  isMagoInimigo,
  isReiInimigo,
  usaSaidaComCoroa,
  usesLongChargeMove,
  usesMeleeChargeAttack,
  usesSheetEnemyDeath,
} from "./enemyKind";
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
  | "knight_exit_arena"
  | "corridor_entrance"
  | "walking"
  | "dialogue"
  | "battle"
  | "enemy_fall"
  | "knight_fall"
  | "victory_final"
  | "defeat";

const DIALOGO_PADRAO = "Voce nunca passara por mim verme!";
const DIALOGO_REI = "Você atravessou o Corredor Real... agora lute por sua coroa.";
const WALK_MS = 5000;
const EXIT_MS = WALK_MS;
const FALL_MS = 1400;
const GOBLIN_CHARGE_MS = 720;
const GOBLIN_RETREAT_MS = 720;
const ENEMY_KNIGHT_CHARGE_MS = 1400;
const ENEMY_KNIGHT_RETREAT_MS = 1400;
const ATTACK_MS = KNIGHT_ANIM_MS.attack;
const ATTACK_BLAST_MS = KNIGHT_ANIM_MS.attackBlast;
const HURT_MS = KNIGHT_ANIM_MS.hurt;

function usarPainelCodigo(batalha: Batalha): boolean {
  if (batalha.ehRei) {
    return batalha.vidaInimigo <= 1;
  }
  return batalha.tipoInimigo === "CODIGO";
}

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
  const [enemyFlipped, setEnemyFlipped] = useState(false);
  const [enemyMovePhase, setEnemyMovePhase] = useState<EnemyMovePhase>("none");
  const [animandoHit, setAnimandoHit] = useState(false);
  const [energyBlast, setEnergyBlast] = useState(false);
  const [mageMagic, setMageMagic] = useState(false);
  const [kingAttack, setKingAttack] = useState<KingAttackVariant>(1);
  const [crownActive, setCrownActive] = useState(false);
  const [sequencia, setSequencia] = useState(0);
  const walkTimer = useRef<number | null>(null);
  const hitTimer = useRef<number | null>(null);
  const attackEndTimer = useRef<number | null>(null);
  const enemyAttackTimer = useRef<number | null>(null);
  const deathAdvanceTimer = useRef<number | null>(null);
  const corridorEntranceTimer = useRef<number | null>(null);
  const pendingCorridorEntrance = useRef(false);
  const pendingHitRef = useRef<{ parcial: Partial<Batalha>; resultado: ResultadoAcao } | null>(null);
  const inimigoAtualRef = useRef(inimigoAtual);
  const onEnemyAttackCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    inimigoAtualRef.current = inimigoAtual;
  }, [inimigoAtual]);

  const limparTimers = useCallback(() => {
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    if (attackEndTimer.current) window.clearTimeout(attackEndTimer.current);
    if (enemyAttackTimer.current) window.clearTimeout(enemyAttackTimer.current);
    if (deathAdvanceTimer.current) window.clearTimeout(deathAdvanceTimer.current);
    if (corridorEntranceTimer.current) window.clearTimeout(corridorEntranceTimer.current);
    walkTimer.current = null;
    hitTimer.current = null;
    attackEndTimer.current = null;
    enemyAttackTimer.current = null;
    deathAdvanceTimer.current = null;
    corridorEntranceTimer.current = null;
    pendingHitRef.current = null;
    onEnemyAttackCompleteRef.current = null;
    setEnemyFlipped(false);
    setEnemyMovePhase("none");
    setEnergyBlast(false);
    setMageMagic(false);
    setCrownActive(false);
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
      setEnemyPose(proximo?.ehRei ? "idle" : "approach");
      setKnightPose("walk");

      if (pendingCorridorEntrance.current) {
        pendingCorridorEntrance.current = false;
        setFase("corridor_entrance");

        corridorEntranceTimer.current = window.setTimeout(() => {
          setFase("walking");
          walkTimer.current = window.setTimeout(() => {
            setKnightPose("idle");
            setEnemyPose("idle");
            setFase("dialogue");
          }, WALK_MS);
        }, WALK_MS);
        return;
      }

      setFase("walking");

      walkTimer.current = window.setTimeout(() => {
        setKnightPose("idle");
        setEnemyPose("idle");
        setFase("dialogue");
      }, WALK_MS);
    },
    [limparTimers],
  );

  const iniciarSaidaArena = useCallback(() => {
    setBatalha(null);
    setFase("knight_exit_arena");
    setKnightPose("walk");

    walkTimer.current = window.setTimeout(() => {
      setCrownActive(true);
    }, EXIT_MS);
  }, []);

  function avancarAposMorteInimigo() {
    if (usaSaidaComCoroa(inimigoAtualRef.current)) {
      iniciarSaidaArena();
      return;
    }
    void aposVitoria();
  }

  const handleEnemyDeathComplete = useCallback(() => {
    if (fase !== "enemy_fall") return;
    deathAdvanceTimer.current = window.setTimeout(() => {
      avancarAposMorteInimigo();
    }, 0);
  }, [fase, iniciarSaidaArena]);

  const handleEnemyAttackComplete = useCallback(() => {
    onEnemyAttackCompleteRef.current?.();
    onEnemyAttackCompleteRef.current = null;
  }, []);

  const handleCrownDone = useCallback(() => {
    setCrownActive(false);
    void (async () => {
      try {
        const u = await buscarUsuario(usuario.id);
        setUsuario(u);
        if (u.venceuRei) {
          setFase("victory_final");
          setKnightPose("idle");
          setInimigoAtual(null);
          return;
        }
        const proximo = inimigos.find((i) => i.ordemNoCorredor === u.progresso);
        pendingCorridorEntrance.current = Boolean(proximo && !proximo.ehRei);
        iniciarCaminhada(inimigos, u);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao avançar no corredor.");
        setFase("defeat");
      }
    })();
  }, [usuario.id, inimigos, iniciarCaminhada]);

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

  function iniciarDerrotaCavaleiro() {
    setAnimandoHit(false);
    setEnemyFlipped(false);
    setEnemyMovePhase("none");
    setMageMagic(false);
    setEnemyPose("idle");
    setKnightPose("defeat");
    setFase("knight_fall");
  }

  const handleKnightDefeatComplete = useCallback(() => {
    if (fase !== "knight_fall") return;
    setFase("defeat");
  }, [fase]);

  function finalizarAposAnimacao(resultado: ResultadoAcao) {
    setAnimandoHit(false);
    setEnemyFlipped(false);
    setEnemyMovePhase("none");
    setMageMagic(false);

    if (resultado.status === "VITORIA") {
      setKnightPose("idle");
      setEnemyPose("fall");
      setFase("enemy_fall");

      if (!usesSheetEnemyDeath(inimigoAtualRef.current)) {
        deathAdvanceTimer.current = window.setTimeout(() => {
          avancarAposMorteInimigo();
        }, FALL_MS);
      }
      return;
    }

    if (resultado.status === "DERROTA") {
      iniciarDerrotaCavaleiro();
      return;
    }

    setKnightPose("idle");
    setEnemyPose("idle");
  }

  function msRecuperacaoAposGolpe(attackMs: number, hitMs: number): number {
    return Math.max(0, hitMs + HURT_MS - attackMs);
  }

  function ligarImpactoDoAtaqueInimigo(
    parcial: Partial<Batalha>,
    resultado: ResultadoAcao,
    hitMs: number,
    attackMs: number,
    retreatMs: number,
  ) {
    hitTimer.current = window.setTimeout(() => {
      setBatalha((atual) => (atual ? { ...atual, ...parcial } : atual));
      setKnightPose("hurt");
    }, hitMs);

    onEnemyAttackCompleteRef.current = () => {
      hitTimer.current = window.setTimeout(() => {
        if (resultado.status === "DERROTA") {
          iniciarDerrotaCavaleiro();
          return;
        }

        setKnightPose("idle");
        setEnemyFlipped(true);
        setEnemyMovePhase("retreat");
        setEnemyPose("approach");

        enemyAttackTimer.current = window.setTimeout(() => {
          setEnemyFlipped(false);
          setEnemyMovePhase("none");
          setEnemyPose("idle");
          finalizarAposAnimacao(resultado);
        }, retreatMs);
      }, msRecuperacaoAposGolpe(attackMs, hitMs));
    };
  }

  function iniciarAtaqueMelee(
    parcial: Partial<Batalha>,
    resultado: ResultadoAcao,
    chargeMs: number,
    retreatMs: number,
    hitMs: number,
    attackMs: number,
  ) {
    setEnemyFlipped(false);
    setEnemyMovePhase("charge");
    setEnemyPose("approach");
    setKnightPose("idle");

    const iniciarGolpe = () => {
      setEnemyMovePhase("atKnight");
      setEnemyPose("attack");
      ligarImpactoDoAtaqueInimigo(parcial, resultado, hitMs, attackMs, retreatMs);
    };

    enemyAttackTimer.current = window.setTimeout(iniciarGolpe, chargeMs);
  }

  function iniciarAtaqueGoblin(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    iniciarAtaqueMelee(
      parcial,
      resultado,
      GOBLIN_CHARGE_MS,
      GOBLIN_RETREAT_MS,
      GOBLIN_ATTACK_HIT_MS,
      GOBLIN_ANIM_MS.attack,
    );
  }

  function iniciarAtaqueEsqueleto(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    iniciarAtaqueMelee(
      parcial,
      resultado,
      GOBLIN_CHARGE_MS,
      GOBLIN_RETREAT_MS,
      SKELETON_ATTACK_HIT_MS,
      SKELETON_ANIM_MS.attack,
    );
  }

  /** Cavaleiro inimigo: Run (charge) → Attack no cavaleiro → Run espelhado (retreat). */
  function iniciarAtaqueCavaleiroInimigo(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    iniciarAtaqueMelee(
      parcial,
      resultado,
      ENEMY_KNIGHT_CHARGE_MS,
      ENEMY_KNIGHT_RETREAT_MS,
      ENEMY_KNIGHT_ATTACK_HIT_MS,
      ENEMY_KNIGHT_ANIM_MS.attack,
    );
  }

  /** Rei: Run até o cavaleiro → um dos 3 ataques ao acaso → Run espelhado de volta. */
  function iniciarAtaqueRei(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    const variante = (Math.floor(Math.random() * 3) + 1) as KingAttackVariant;
    setKingAttack(variante);
    iniciarAtaqueMelee(
      parcial,
      resultado,
      ENEMY_KNIGHT_CHARGE_MS,
      ENEMY_KNIGHT_RETREAT_MS,
      KING_ATTACK_HIT_MS,
      KING_ANIM_MS.attack,
    );
  }

  /** Mago: Attack no idle; Charge2 sai no antepenúltimo quadro. */
  function iniciarAtaqueMago(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    setEnemyFlipped(false);
    setEnemyMovePhase("none");
    setEnemyPose("attack");
    setKnightPose("idle");
    pendingHitRef.current = { parcial, resultado };

    enemyAttackTimer.current = window.setTimeout(() => {
      setMageMagic(true);
    }, MAGE_ATTACK_SHOT_MS);

    onEnemyAttackCompleteRef.current = () => {
      setEnemyPose("idle");
    };
  }

  const handleMageMagicHit = useCallback(() => {
    const pending = pendingHitRef.current;
    if (!pending) return;

    pendingHitRef.current = null;
    setBatalha((atual) => (atual ? { ...atual, ...pending.parcial } : atual));
    setKnightPose("hurt");

    hitTimer.current = window.setTimeout(() => {
      finalizarAposAnimacao(pending.resultado);
    }, HURT_MS);
  }, []);

  const handleMageMagicComplete = useCallback(() => {
    setMageMagic(false);
  }, []);

  const resolverImpactoEnergia = useCallback(() => {
    const pending = pendingHitRef.current;
    if (!pending) return;

    pendingHitRef.current = null;
    setEnergyBlast(false);
    setBatalha((atual) => (atual ? { ...atual, ...pending.parcial } : atual));
    setEnemyPose("hurt");

    const hurtMs = isGoblinInimigo(inimigoAtualRef.current)
      ? GOBLIN_ANIM_MS.hurt
      : isEsqueletoInimigo(inimigoAtualRef.current)
        ? SKELETON_ANIM_MS.hurt
        : isCavaleiroInimigo(inimigoAtualRef.current)
          ? ENEMY_KNIGHT_ANIM_MS.hurt
          : isMagoInimigo(inimigoAtualRef.current)
            ? MAGE_ANIM_MS.hurt
            : isReiInimigo(inimigoAtualRef.current)
              ? KING_ANIM_MS.hurt
            : HURT_MS;
    hitTimer.current = window.setTimeout(() => {
      finalizarAposAnimacao(pending.resultado);
    }, hurtMs);
  }, []);

  function atualizarBatalha(parcial: Partial<Batalha>, resultado: ResultadoAcao) {
    setSequencia((s) => (resultado.acertou ? s + 1 : 0));
    setAnimandoHit(true);

    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    if (attackEndTimer.current) window.clearTimeout(attackEndTimer.current);
    if (enemyAttackTimer.current) window.clearTimeout(enemyAttackTimer.current);
    pendingHitRef.current = null;
    onEnemyAttackCompleteRef.current = null;
    setEnergyBlast(false);
    setMageMagic(false);
    setEnemyFlipped(false);
    setEnemyMovePhase("none");

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

    // Errou: dano do jogador só quando o sprite de ataque do inimigo começa.
    if (isCavaleiroInimigo(inimigoAtual)) {
      iniciarAtaqueCavaleiroInimigo(parcial, resultado);
      return;
    }

    if (isGoblinInimigo(inimigoAtual)) {
      iniciarAtaqueGoblin(parcial, resultado);
      return;
    }

    if (isEsqueletoInimigo(inimigoAtual)) {
      iniciarAtaqueEsqueleto(parcial, resultado);
      return;
    }

    if (isMagoInimigo(inimigoAtual)) {
      iniciarAtaqueMago(parcial, resultado);
      return;
    }

    if (isReiInimigo(inimigoAtual)) {
      iniciarAtaqueRei(parcial, resultado);
      return;
    }

    setEnemyPose("attack");
    setBatalha((atual) => (atual ? { ...atual, ...parcial } : atual));
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
    fase === "walking" || fase === "corridor_entrance"
      ? "walking"
      : fase === "dialogue"
        ? "dialogue"
        : fase === "battle"
          ? "battle"
        : fase === "enemy_fall"
          ? "enemy_fall"
          : fase === "knight_fall"
            ? "battle"
            : "ended";

  const isPrimeiroInimigo = inimigoAtual?.ordemNoCorredor === 1;
  const isRei = isReiInimigo(inimigoAtual);
  const arenaEstatica = isPrimeiroInimigo || isRei;
  const arenaKind: ArenaKind = isRei ? "throne" : isPrimeiroInimigo ? "first" : "corridor";
  const scrolling = (fase === "walking" || fase === "corridor_entrance") && !arenaEstatica;
  const corridorScrollPrep = fase === "corridor_entrance";
  const enemyScrollWaiting = corridorScrollPrep;
  const scrollActive = scrolling && !corridorScrollPrep;
  const knightEntering =
    (fase === "walking" && arenaEstatica) || fase === "corridor_entrance";
  const knightExiting = fase === "knight_exit_arena";
  const enemyVisible =
    Boolean(inimigoAtual) &&
    (fase === "corridor_entrance" ||
      fase === "walking" ||
      fase === "dialogue" ||
      fase === "battle" ||
      fase === "knight_fall" ||
      fase === "enemy_fall" ||
      (fase === "knight_exit_arena" && enemyPose === "fall"));
  const emBatalha = fase === "battle" && batalha;
  const painelDireito = emBatalha || fase === "enemy_fall";
  const salas = [...inimigos].sort((a, b) => a.ordemNoCorredor - b.ordemNoCorredor);
  const vidaAtual = batalha?.vidaJogador ?? 3;
  const enemyChargeMs = usesLongChargeMove(inimigoAtual)
    ? ENEMY_KNIGHT_CHARGE_MS
    : GOBLIN_CHARGE_MS;
  const enemyRetreatMs = usesLongChargeMove(inimigoAtual)
    ? ENEMY_KNIGHT_RETREAT_MS
    : GOBLIN_RETREAT_MS;

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
            onKnightDefeatComplete={handleKnightDefeatComplete}
            enemyPose={enemyPose}
            enemyFlipped={enemyFlipped}
            enemyMovePhase={enemyMovePhase}
            onEnemyAnimationComplete={
              usesSheetEnemyDeath(inimigoAtual) ? handleEnemyDeathComplete : undefined
            }
            onEnemyAttackComplete={
              usesMeleeChargeAttack(inimigoAtual) || isMagoInimigo(inimigoAtual)
                ? handleEnemyAttackComplete
                : undefined
            }
            vidaJogador={batalha?.vidaJogador}
            vidaInimigo={batalha?.vidaInimigo}
            compact={Boolean(painelDireito) && !arenaEstatica}
            energyBlast={energyBlast}
            onEnergyBlastHit={resolverImpactoEnergia}
            mageMagic={mageMagic}
            onMageMagicHit={handleMageMagicHit}
            onMageMagicComplete={handleMageMagicComplete}
            arenaKind={arenaKind}
            knightEntering={knightEntering}
            knightExiting={knightExiting}
            enemyScrollWaiting={enemyScrollWaiting}
            scrollActive={scrollActive}
            walkDurationMs={knightExiting ? EXIT_MS : WALK_MS}
            enemyChargeMs={enemyChargeMs}
            enemyRetreatMs={enemyRetreatMs}
            kingAttack={kingAttack}
          />

          {fase === "dialogue" && inimigoAtual && (
            <DialogueBox
              speaker={inimigoAtual.nome}
              text={isReiInimigo(inimigoAtual) ? DIALOGO_REI : DIALOGO_PADRAO}
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
            {usarPainelCodigo(batalha) ? (
              <CodeBattle
                batalha={batalha}
                linguagem={usuario.linguagem}
                onAtualizarBatalha={atualizarBatalha}
                disabled={animandoHit || fase !== "battle"}
              />
            ) : (
              <QuizBattle
                batalha={batalha}
                totalPerguntas={inimigoAtual.ehRei ? 4 : inimigoAtual.vidaMaxima}
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

      <CrownTransition active={crownActive} onDone={handleCrownDone} />
    </div>
  );
}
