export type EnemyPose = "idle" | "approach" | "attack" | "hurt" | "fall";

type Props = {
  nome: string;
  ehRei?: boolean;
  pose?: EnemyPose;
  className?: string;
};

/** Sprite pixelado procedural por nome do inimigo (seed do backend). */
export default function EnemySprite({
  nome,
  ehRei = false,
  pose = "idle",
  className = "",
}: Props) {
  const kind = classify(nome, ehRei);

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

function classify(nome: string, ehRei: boolean): string {
  if (ehRei) return "rei";
  const n = nome.toLowerCase();
  if (n.includes("goblin")) return "goblin";
  if (n.includes("esqueleto")) return "esqueleto";
  if (n.includes("mago")) return "mago";
  if (n.includes("cavaleiro")) return "cavaleiro";
  return "goblin";
}
