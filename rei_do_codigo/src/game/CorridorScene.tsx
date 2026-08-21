import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Inimigo } from "../api";
import CodeEnergyBlast from "./components/CodeEnergyBlast";
import EnemyArrow from "./components/EnemyArrow";
import KnightSprite, { KNIGHT_BLAST_MS, type KnightPose } from "./sprites/KnightSprite";
import EnemySprite, { type EnemyPose } from "./sprites/EnemySprite";
import VidasBar from "./components/VidasBar";
import { enemyStackClass, isCavaleiroInimigo } from "./enemyKind";

export type CorridorMode = "walking" | "dialogue" | "battle" | "enemy_fall" | "ended";
export type EnemyMovePhase = "none" | "charge" | "atKnight" | "retreat";

type BlastPoint = { x: number; y: number };

type Props = {
  mode: CorridorMode;
  scrolling: boolean;
  inimigo: Inimigo | null;
  enemyVisible: boolean;
  knightPose: KnightPose;
  onKnightDefeatComplete?: () => void;
  enemyPose: EnemyPose;
  enemyFlipped?: boolean;
  enemyMovePhase?: EnemyMovePhase;
  onEnemyAnimationComplete?: () => void;
  onEnemyAttackComplete?: () => void;
  vidaJogador?: number;
  vidaInimigo?: number;
  compact?: boolean;
  energyBlast?: boolean;
  onEnergyBlastHit?: () => void;
  enemyArrow?: boolean;
  onEnemyArrowHit?: () => void;
  arrowDurationMs?: number;
  /** Primeiro inimigo: fundo estático da arena + entrada lateral dos atores. */
  arenaPrimeiroInimigo?: boolean;
  knightEntering?: boolean;
  knightExiting?: boolean;
  enemyScrollWaiting?: boolean;
  scrollActive?: boolean;
  walkDurationMs?: number;
  enemyChargeMs?: number;
  enemyRetreatMs?: number;
};

/**
 * Cavaleiro fica fixo na tela; o cenário (e o inimigo no mundo) se movem.
 * Ataque de teste: animação no lugar + rajada de energia até o inimigo.
 */
export default function CorridorScene({
  mode,
  scrolling,
  inimigo,
  enemyVisible,
  knightPose,
  onKnightDefeatComplete,
  enemyPose,
  enemyFlipped = false,
  enemyMovePhase = "none",
  onEnemyAnimationComplete,
  onEnemyAttackComplete,
  vidaJogador,
  vidaInimigo,
  compact = false,
  energyBlast = false,
  onEnergyBlastHit,
  enemyArrow = false,
  onEnemyArrowHit,
  arrowDurationMs = 520,
  arenaPrimeiroInimigo = false,
  knightEntering = false,
  knightExiting = false,
  enemyScrollWaiting = false,
  scrollActive = false,
  walkDurationMs = 5000,
  enemyChargeMs = 720,
  enemyRetreatMs = 720,
}: Props) {
  const actorsRef = useRef<HTMLDivElement>(null);
  const knightVisualRef = useRef<HTMLDivElement>(null);
  const enemySlotRef = useRef<HTMLDivElement>(null);
  const [blastPoints, setBlastPoints] = useState<{ from: BlastPoint; to: BlastPoint } | null>(null);
  const [arrowPoints, setArrowPoints] = useState<{ from: BlastPoint; to: BlastPoint } | null>(null);

  const measureBlastPoints = useCallback(() => {
    const actors = actorsRef.current;
    const knight = knightVisualRef.current;
    const enemy = enemySlotRef.current;
    if (!actors || !knight || !enemy) return null;

    const actorsRect = actors.getBoundingClientRect();
    const knightRect = knight.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    return {
      from: {
        x: knightRect.right - actorsRect.left - 6,
        y: knightRect.top - actorsRect.top + knightRect.height * 0.42,
      },
      to: {
        x: enemyRect.left - actorsRect.left + 18,
        y: enemyRect.top - actorsRect.top + enemyRect.height * 0.5,
      },
    };
  }, []);

  const measureArrowPoints = useCallback(() => {
    const actors = actorsRef.current;
    const knight = knightVisualRef.current;
    const enemy = enemySlotRef.current;
    if (!actors || !knight || !enemy) return null;

    const actorsRect = actors.getBoundingClientRect();
    const knightRect = knight.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    return {
      from: {
        x: enemyRect.left - actorsRect.left + enemyRect.width * 0.22,
        y: enemyRect.top - actorsRect.top + enemyRect.height * 0.42,
      },
      to: {
        x: knightRect.left - actorsRect.left + knightRect.width * 0.55,
        y: knightRect.top - actorsRect.top + knightRect.height * 0.42,
      },
    };
  }, []);

  useLayoutEffect(() => {
    if (!energyBlast) {
      setBlastPoints(null);
      return;
    }
    setBlastPoints(measureBlastPoints());
  }, [energyBlast, measureBlastPoints]);

  useLayoutEffect(() => {
    if (!enemyArrow) {
      setArrowPoints(null);
      return;
    }
    setArrowPoints(measureArrowPoints());
  }, [enemyArrow, measureArrowPoints]);

  const backgroundSrc = arenaPrimeiroInimigo
    ? "/game/fundo-corredor-completo.png"
    : "/game/fundo-corredor.png";

  const sceneStyle = {
    "--rk-walk-ms": `${walkDurationMs}ms`,
    "--rk-scroll-ms": `${walkDurationMs}ms`,
    "--rk-goblin-charge-ms": `${enemyChargeMs}ms`,
    "--rk-goblin-retreat-ms": `${enemyRetreatMs}ms`,
  } as React.CSSProperties;

  const sceneClass = [
    "rk-scene",
    compact && "rk-scene--compact",
    scrolling && "rk-scene--scroll",
    scrollActive && "rk-scene--scroll-active",
    arenaPrimeiroInimigo && "rk-scene--arena",
    mode === "dialogue" && "rk-scene--dialogue",
  ]
    .filter(Boolean)
    .join(" ");

  const arenaBackdropStyle = arenaPrimeiroInimigo
    ? {
        backgroundImage: `url("${backgroundSrc}")`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <div className={sceneClass} style={sceneStyle}>
      <div className="rk-scene__backdrop" aria-hidden style={arenaBackdropStyle}>
        {!arenaPrimeiroInimigo && (
          <div className="rk-scene__backdrop-track">
            <img className="rk-scene__backdrop-img" src={backgroundSrc} alt="" draggable={false} />
            <img className="rk-scene__backdrop-img" src={backgroundSrc} alt="" draggable={false} />
          </div>
        )}
      </div>

      <div ref={actorsRef} className="rk-scene__actors">
        <div
          className={`rk-scene__knight-slot${knightEntering ? " rk-scene__knight-slot--entering" : ""}${knightExiting ? " rk-scene__knight-slot--exiting" : ""}`}
        >
          <div className="rk-scene__knight-move">
            <div className="rk-knight-stack">
              {mode === "battle" && typeof vidaJogador === "number" && (
                <div className="rk-scene__hp rk-scene__hp--player">
                  <VidasBar label="Você" atual={vidaJogador} maxima={3} />
                </div>
              )}
              <div ref={knightVisualRef} className="rk-knight-visual">
                <KnightSprite
                  pose={knightPose}
                  onAnimationComplete={
                    knightPose === "defeat" ? onKnightDefeatComplete : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {inimigo && enemyVisible && (
          <div
            ref={enemySlotRef}
            className={[
              "rk-scene__enemy-slot",
              `rk-scene__enemy-slot--${mode}`,
              enemyScrollWaiting && "rk-scene__enemy-slot--scroll-wait",
              enemyMovePhase === "charge" &&
                (inimigo && isCavaleiroInimigo(inimigo)
                  ? "rk-scene__enemy-slot--charge-knight"
                  : "rk-scene__enemy-slot--charge"),
              enemyMovePhase === "atKnight" && "rk-scene__enemy-slot--at-knight",
              enemyMovePhase === "retreat" &&
                (inimigo && isCavaleiroInimigo(inimigo)
                  ? "rk-scene__enemy-slot--retreat-knight"
                  : "rk-scene__enemy-slot--retreat"),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={`rk-enemy-stack${enemyStackClass(inimigo)}`}>
              {mode === "battle" && typeof vidaInimigo === "number" && (
                <div className="rk-scene__hp rk-scene__hp--enemy">
                  <VidasBar
                    label={inimigo.nome}
                    atual={vidaInimigo}
                    maxima={inimigo.vidaMaxima}
                    variante="inimigo"
                  />
                </div>
              )}
              <div className="rk-enemy-visual">
                <EnemySprite
                  nome={inimigo.nome}
                  ehRei={inimigo.ehRei}
                  pose={enemyPose}
                  flipped={enemyFlipped}
                  movePhase={enemyMovePhase}
                  onAnimationComplete={onEnemyAnimationComplete}
                  onAttackComplete={onEnemyAttackComplete}
                />
              </div>
            </div>
          </div>
        )}

        {energyBlast && blastPoints && (
          <CodeEnergyBlast
            from={blastPoints.from}
            to={blastPoints.to}
            durationMs={KNIGHT_BLAST_MS}
            onHit={onEnergyBlastHit}
          />
        )}

        {enemyArrow && arrowPoints && (
          <EnemyArrow
            from={arrowPoints.from}
            to={arrowPoints.to}
            durationMs={arrowDurationMs}
            onHit={onEnemyArrowHit}
          />
        )}
      </div>

      <div className="rk-scene__vignette" />
    </div>
  );
}
