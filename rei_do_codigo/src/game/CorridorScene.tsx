import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Inimigo } from "../api";
import CodeEnergyBlast from "./components/CodeEnergyBlast";
import KnightSprite, { KNIGHT_BLAST_MS, type KnightPose } from "./sprites/KnightSprite";
import EnemySprite, { type EnemyPose } from "./sprites/EnemySprite";
import VidasBar from "./components/VidasBar";

export type CorridorMode = "walking" | "dialogue" | "battle" | "enemy_fall" | "ended";

type BlastPoint = { x: number; y: number };

type Props = {
  mode: CorridorMode;
  scrolling: boolean;
  inimigo: Inimigo | null;
  enemyVisible: boolean;
  knightPose: KnightPose;
  enemyPose: EnemyPose;
  vidaJogador?: number;
  vidaInimigo?: number;
  compact?: boolean;
  energyBlast?: boolean;
  onEnergyBlastHit?: () => void;
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
  enemyPose,
  vidaJogador,
  vidaInimigo,
  compact = false,
  energyBlast = false,
  onEnergyBlastHit,
}: Props) {
  const actorsRef = useRef<HTMLDivElement>(null);
  const knightVisualRef = useRef<HTMLDivElement>(null);
  const enemySlotRef = useRef<HTMLDivElement>(null);
  const [blastPoints, setBlastPoints] = useState<{ from: BlastPoint; to: BlastPoint } | null>(null);

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

  useLayoutEffect(() => {
    if (!energyBlast) {
      setBlastPoints(null);
      return;
    }
    setBlastPoints(measureBlastPoints());
  }, [energyBlast, measureBlastPoints]);

  return (
    <div className={`rk-scene${compact ? " rk-scene--compact" : ""}${scrolling ? " rk-scene--scroll" : ""}`}>
      <div className="rk-scene__backdrop" aria-hidden>
        <div className="rk-scene__backdrop-track">
          <img className="rk-scene__backdrop-img" src="/game/fundo-corredor.png" alt="" draggable={false} />
          <img className="rk-scene__backdrop-img" src="/game/fundo-corredor.png" alt="" draggable={false} />
        </div>
      </div>

      <div ref={actorsRef} className="rk-scene__actors">
        <div className="rk-scene__knight-slot">
          <div className="rk-scene__knight-move">
            <div className="rk-knight-stack">
              {mode === "battle" && typeof vidaJogador === "number" && (
                <div className="rk-scene__hp rk-scene__hp--player">
                  <VidasBar label="Você" atual={vidaJogador} maxima={3} />
                </div>
              )}
              <div ref={knightVisualRef} className="rk-knight-visual">
                <KnightSprite pose={knightPose} />
              </div>
            </div>
          </div>
        </div>

        {inimigo && enemyVisible && (
          <div
            ref={enemySlotRef}
            className={`rk-scene__enemy-slot rk-scene__enemy-slot--${mode}`}
          >
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
            <EnemySprite
              nome={inimigo.nome}
              ehRei={inimigo.ehRei}
              pose={enemyPose}
            />
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
      </div>

      <div className="rk-scene__vignette" />
    </div>
  );
}
