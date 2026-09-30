import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Inimigo } from "../api";
import CodeEnergyBlast from "./components/CodeEnergyBlast";
import EnemyArrow from "./components/EnemyArrow";
import MageMagic from "./components/MageMagic";
import KnightSprite, { KNIGHT_BLAST_MS, type KnightPose } from "./sprites/KnightSprite";
import EnemySprite, { type EnemyPose } from "./sprites/EnemySprite";
import VidasBar from "./components/VidasBar";
import { enemyStackClass, isGoblinInimigo, usesLongChargeMove } from "./enemyKind";
import { layoutBoxRelativeTo, measureMeleeStandRight, readUiZoom } from "./layoutZoom";
import type { KingAttackVariant } from "./sprites/KingSprite";

export type CorridorMode = "walking" | "dialogue" | "battle" | "enemy_fall" | "ended";
export type EnemyMovePhase = "none" | "charge" | "atKnight" | "retreat";
export type ArenaKind = "corridor" | "first" | "throne";

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
  mageMagic?: boolean;
  onMageMagicHit?: () => void;
  onMageMagicComplete?: () => void;
  /** Arena estática: primeiro inimigo, sala do trono, ou corredor com scroll. */
  arenaKind?: ArenaKind;
  knightEntering?: boolean;
  knightWaitingEnter?: boolean;
  knightExiting?: boolean;
  enemyScrollWaiting?: boolean;
  scrollActive?: boolean;
  walkDurationMs?: number;
  onKnightEnterComplete?: () => void;
  enemyChargeMs?: number;
  enemyRetreatMs?: number;
  kingAttack?: KingAttackVariant;
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
  mageMagic = false,
  onMageMagicHit,
  onMageMagicComplete,
  arenaKind = "corridor",
  knightEntering = false,
  knightWaitingEnter = false,
  knightExiting = false,
  enemyScrollWaiting = false,
  scrollActive = false,
  walkDurationMs = 5000,
  onKnightEnterComplete,
  enemyChargeMs = 720,
  enemyRetreatMs = 720,
  kingAttack = 1,
}: Props) {
  const actorsRef = useRef<HTMLDivElement>(null);
  const knightVisualRef = useRef<HTMLDivElement>(null);
  const enemySlotRef = useRef<HTMLDivElement>(null);
  const [blastPoints, setBlastPoints] = useState<{ from: BlastPoint; to: BlastPoint } | null>(null);
  const [arrowPoints, setArrowPoints] = useState<{ from: BlastPoint; to: BlastPoint } | null>(null);
  const [mageSpellPoints, setMageSpellPoints] = useState<{ from: BlastPoint; to: BlastPoint } | null>(
    null,
  );
  const [meleeStandRight, setMeleeStandRight] = useState<string | undefined>();

  const measureActorBoxes = useCallback(() => {
    const actors = actorsRef.current;
    const knight = knightVisualRef.current;
    const enemy = enemySlotRef.current;
    if (!actors || !knight || !enemy) return null;

    const zoom = readUiZoom();
    const actorsRect = actors.getBoundingClientRect();
    return {
      knight: layoutBoxRelativeTo(actorsRect, knight.getBoundingClientRect(), zoom),
      enemy: layoutBoxRelativeTo(actorsRect, enemy.getBoundingClientRect(), zoom),
    };
  }, []);

  const measureBlastPoints = useCallback(() => {
    const boxes = measureActorBoxes();
    if (!boxes) return null;

    return {
      from: {
        x: boxes.knight.right - 6,
        y: boxes.knight.top + boxes.knight.height * 0.42,
      },
      to: {
        x: boxes.enemy.left + 18,
        y: boxes.enemy.top + boxes.enemy.height * 0.5,
      },
    };
  }, [measureActorBoxes]);

  const measureArrowPoints = useCallback(() => {
    const boxes = measureActorBoxes();
    if (!boxes) return null;

    return {
      from: {
        x: boxes.enemy.left + boxes.enemy.width * 0.22,
        y: boxes.enemy.top + boxes.enemy.height * 0.42,
      },
      to: {
        x: boxes.knight.left + boxes.knight.width * 0.55,
        y: boxes.knight.top + boxes.knight.height * 0.42,
      },
    };
  }, [measureActorBoxes]);

  const updateMeleeStand = useCallback(() => {
    const actors = actorsRef.current;
    const knight = knightVisualRef.current;
    const enemy = enemySlotRef.current;
    if (!actors || !knight || !enemy) return;
    setMeleeStandRight(measureMeleeStandRight(actors, knight, enemy));
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

  useLayoutEffect(() => {
    if (!mageMagic) {
      setMageSpellPoints(null);
      return;
    }
    setMageSpellPoints(measureArrowPoints());
  }, [mageMagic, measureArrowPoints]);

  useLayoutEffect(() => {
    if (!enemyVisible || !inimigo) {
      setMeleeStandRight(undefined);
      return;
    }

    updateMeleeStand();

    const actors = actorsRef.current;
    const observer =
      actors && typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateMeleeStand) : null;
    observer?.observe(actors);
    window.addEventListener("resize", updateMeleeStand);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateMeleeStand);
    };
  }, [compact, enemyVisible, inimigo, updateMeleeStand]);

  const staticArena = arenaKind === "first" || arenaKind === "throne";
  const backgroundSrc =
    arenaKind === "throne"
      ? "/game/fundo-trono.png"
      : arenaKind === "first"
        ? "/game/fundo-corredor-completo.png"
        : "/game/fundo-corredor.png";

  const sceneStyle = {
    "--rk-walk-ms": `${walkDurationMs}ms`,
    "--rk-scroll-ms": `${walkDurationMs}ms`,
    "--rk-goblin-charge-ms": `${enemyChargeMs}ms`,
    "--rk-goblin-retreat-ms": `${enemyRetreatMs}ms`,
    ...(meleeStandRight ? { "--rk-enemy-at-knight-right": meleeStandRight } : {}),
  } as React.CSSProperties;

  const sceneClass = [
    "rk-scene",
    compact && "rk-scene--compact",
    scrolling && "rk-scene--scroll",
    scrollActive && "rk-scene--scroll-active",
    staticArena && "rk-scene--arena",
    arenaKind === "throne" && "rk-scene--throne",
    mode === "dialogue" && "rk-scene--dialogue",
  ]
    .filter(Boolean)
    .join(" ");

  const arenaBackdropStyle =
    staticArena
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
        {arenaKind === "corridor" && (
          <div className="rk-scene__backdrop-track">
            <img className="rk-scene__backdrop-img" src={backgroundSrc} alt="" draggable={false} />
            <img className="rk-scene__backdrop-img" src={backgroundSrc} alt="" draggable={false} />
          </div>
        )}
      </div>

      <div ref={actorsRef} className="rk-scene__actors">
        <div
          className={`rk-scene__knight-slot${knightWaitingEnter ? " rk-scene__knight-slot--waiting-enter" : ""}${knightEntering ? " rk-scene__knight-slot--entering" : ""}${knightExiting ? " rk-scene__knight-slot--exiting" : ""}`}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!knightEntering || !onKnightEnterComplete) return;
            if (
              event.animationName !== "rk-knight-enter" &&
              event.animationName !== "rk-knight-enter-corridor"
            ) {
              return;
            }
            onKnightEnterComplete();
          }}
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
              `rk-scene__enemy-slot--${
                (inimigo.ehRei || isGoblinInimigo(inimigo)) && mode === "walking"
                  ? "stationed"
                  : mode
              }`,
              enemyScrollWaiting && "rk-scene__enemy-slot--scroll-wait",
              enemyMovePhase === "charge" &&
                (usesLongChargeMove(inimigo)
                  ? "rk-scene__enemy-slot--charge-knight"
                  : "rk-scene__enemy-slot--charge"),
              enemyMovePhase === "atKnight" && "rk-scene__enemy-slot--at-knight",
              enemyMovePhase === "retreat" &&
                (usesLongChargeMove(inimigo)
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
                  kingAttack={kingAttack}
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

        {mageMagic && mageSpellPoints && (
          <MageMagic
            from={mageSpellPoints.from}
            to={mageSpellPoints.to}
            onHit={onMageMagicHit}
            onComplete={onMageMagicComplete}
          />
        )}
      </div>

      <div className="rk-scene__vignette" />
    </div>
  );
}
