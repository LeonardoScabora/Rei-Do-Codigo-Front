import GoblinSprite, { type GoblinPose, GOBLIN_ANIM_MS, GOBLIN_ATTACK_HIT_MS } from "./GoblinSprite";
import SkeletonSprite, { type SkeletonPose, SKELETON_ANIM_MS, SKELETON_ATTACK_HIT_MS } from "./SkeletonSprite";
import EnemyKnightSprite, {
  type EnemyKnightPose,
  ENEMY_KNIGHT_ANIM_MS,
  ENEMY_KNIGHT_ATTACK_HIT_MS,
} from "./EnemyKnightSprite";
import MageSprite, { type MagePose, MAGE_ANIM_MS, MAGE_ATTACK_SHOT_MS } from "./MageSprite";
import type { EnemyMovePhase } from "../CorridorScene";

export type EnemyPose = "idle" | "approach" | "attack" | "hurt" | "fall";

type Props = {
  nome: string;
  ehRei?: boolean;
  pose?: EnemyPose;
  flipped?: boolean;
  movePhase?: EnemyMovePhase;
  className?: string;
  onAnimationComplete?: () => void;
  onAttackComplete?: () => void;
};

export {
  GOBLIN_ANIM_MS,
  GOBLIN_ATTACK_HIT_MS,
  SKELETON_ANIM_MS,
  SKELETON_ATTACK_HIT_MS,
  ENEMY_KNIGHT_ANIM_MS,
  ENEMY_KNIGHT_ATTACK_HIT_MS,
  MAGE_ANIM_MS,
  MAGE_ATTACK_SHOT_MS,
};

/** Sprite do inimigo: goblin, esqueleto, cavaleiro e mago usam sheets; demais usam pixel art procedural. */
export default function EnemySprite({
  nome,
  ehRei = false,
  pose = "idle",
  flipped = false,
  movePhase = "none",
  className = "",
  onAnimationComplete,
  onAttackComplete,
}: Props) {
  const kind = classify(nome, ehRei);

  if (kind === "goblin") {
    return (
      <GoblinSprite
        pose={mapMeleePose(pose)}
        flipped={flipped}
        className={className}
        onAnimationComplete={
          pose === "fall" ? onAnimationComplete : pose === "attack" ? onAttackComplete : undefined
        }
      />
    );
  }

  if (kind === "esqueleto") {
    return (
      <SkeletonSprite
        pose={mapMeleePose(pose)}
        flipped={flipped}
        className={className}
        onAnimationComplete={
          pose === "fall" ? onAnimationComplete : pose === "attack" ? onAttackComplete : undefined
        }
      />
    );
  }

  if (kind === "cavaleiro") {
    return (
      <EnemyKnightSprite
        pose={mapEnemyKnightPose(pose, movePhase)}
        flipped={flipped}
        className={className}
        onAnimationComplete={
          pose === "fall" ? onAnimationComplete : pose === "attack" ? onAttackComplete : undefined
        }
      />
    );
  }

  if (kind === "mago") {
    return (
      <MageSprite
        pose={mapMagePose(pose)}
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
      </div>
      {pose === "attack" && <span className="rk-slash rk-slash--enemy" />}
    </div>
  );
}

function mapEnemyKnightPose(pose: EnemyPose, movePhase: EnemyMovePhase): EnemyKnightPose {
  switch (pose) {
    case "approach":
      return movePhase === "none" ? "walk" : "run";
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

function mapMagePose(pose: EnemyPose): MagePose {
  switch (pose) {
    case "approach":
      return "walk";
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

function mapMeleePose(pose: EnemyPose): GoblinPose & SkeletonPose {
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
  return "generic";
}
