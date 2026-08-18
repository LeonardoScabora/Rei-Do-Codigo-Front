import GoblinSprite, { type GoblinPose, GOBLIN_ANIM_MS } from "./GoblinSprite";

export type EnemyPose = "idle" | "approach" | "attack" | "hurt" | "fall";

type Props = {
  nome: string;
  ehRei?: boolean;
  pose?: EnemyPose;
  flipped?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
  onAttackComplete?: () => void;
};

export { GOBLIN_ANIM_MS };

/** Sprite do inimigo: goblin usa sheets; demais usam pixel art procedural. */
export default function EnemySprite({
  nome,
  ehRei = false,
  pose = "idle",
  flipped = false,
  className = "",
  onAnimationComplete,
  onAttackComplete,
}: Props) {
  const kind = classify(nome, ehRei);

  if (kind === "goblin") {
    return (
      <GoblinSprite
        pose={mapGoblinPose(pose)}
        flipped={flipped}
        className={className}
        onAnimationComplete={
          pose === "fall" ? onAnimationComplete : pose === "attack" ? onAttackComplete : undefined
        }
      />
    );
  }

  return (
    <div
      className={`rk-enemy-sprite rk-enemy-sprite--${kind} rk-enemy-sprite--${pose} ${className}`.trim()}
      aria-label={nome}
    >
      <div className="rk-enemy-body">
        <div className="rk-enemy-head" />
        <div className="rk-enemy-torso" />
        <div className="rk-enemy-legs">
          <span />
          <span />
        </div>
        {kind === "rei" && <div className="rk-enemy-crown" />}
        {kind === "mago" && <div className="rk-enemy-staff" />}
        {kind === "esqueleto" && <div className="rk-enemy-bone" />}
      </div>
      {pose === "attack" && <span className="rk-slash rk-slash--enemy" />}
    </div>
  );
}

function mapGoblinPose(pose: EnemyPose): GoblinPose {
  switch (pose) {
    case "approach":
      return "run";
    case "fall":
      return "death";
    case "hurt":
      return "hurt";
    case "attack":
      return "attack";
    default:
      return "idle";
  }
}

function classify(nome: string, ehRei: boolean): string {
  if (ehRei) return "rei";
  const n = nome.toLowerCase();
  if (n.includes("goblin")) return "goblin";
  if (n.includes("esqueleto")) return "esqueleto";
  if (n.includes("mago")) return "mago";
  if (n.includes("cavaleiro")) return "cavaleiro";
  return "goblin";
}
