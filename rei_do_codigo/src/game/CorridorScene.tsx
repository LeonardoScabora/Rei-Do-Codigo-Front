import type { Inimigo } from "../api";
import KnightSprite, { type KnightPose } from "./sprites/KnightSprite";
import EnemySprite, { type EnemyPose } from "./sprites/EnemySprite";
import VidasBar from "./components/VidasBar";

export type CorridorMode = "walking" | "dialogue" | "battle" | "enemy_fall" | "ended";

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
};

// /** Pilares, estandartes e tochas do corredor (duplicado para o scroll). */
// function DecorSet() {
//   return (
//     <>
//       <span className="rk-window rk-window--l" />
//       <div className="rk-pillar rk-pillar--l">
//         <span className="rk-pillar__cap" />
//         <span className="rk-torch" />
//       </div>
//       <span className="rk-wallbanner rk-wallbanner--purple rk-wallbanner--pl">{"</>"}</span>
//       <span className="rk-wallbanner rk-wallbanner--green">☠</span>
//       <span className="rk-wallbanner rk-wallbanner--purple rk-wallbanner--pr">{"</>"}</span>
//       <div className="rk-pillar rk-pillar--r">
//         <span className="rk-pillar__cap" />
//         <span className="rk-torch" />
//       </div>
//       <span className="rk-window rk-window--r" />
//     </>
//   );
// }

/**
 * Cavaleiro fica fixo na tela; o cenário (e o inimigo no mundo) se movem.
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
}: Props) {
  return (
    <div className={`rk-scene${compact ? " rk-scene--compact" : ""}${scrolling ? " rk-scene--scroll" : ""}`}>
      <div className="rk-scene__sky" />
      <div className="rk-scene__far" />
      <div className="rk-scene__mid" />

      {/* <div className="rk-scene__decor" aria-hidden>
        <div className="rk-scene__decor-half">
          <DecorSet />
        </div>
        <div className="rk-scene__decor-half rk-scene__decor-half--dup">
          <DecorSet />
        </div>
      </div> */}

      <div className="rk-scene__floor" />

      <div className="rk-scene__actors">
        <div className="rk-scene__knight-slot">
          {mode === "battle" && typeof vidaJogador === "number" && (
            <div className="rk-scene__hp rk-scene__hp--player">
              <VidasBar label="Você" atual={vidaJogador} maxima={3} />
            </div>
          )}
          <KnightSprite pose={knightPose} />
        </div>

        {inimigo && enemyVisible && (
          <div className={`rk-scene__enemy-slot rk-scene__enemy-slot--${mode}`}>
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
      </div>

      <div className="rk-scene__vignette" />
    </div>
  );
}
