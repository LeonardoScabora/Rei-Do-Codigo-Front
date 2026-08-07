export type KnightPose = "idle" | "walk" | "attack" | "hurt" | "defeat";

type Props = {
  pose?: KnightPose;
  className?: string;
};

/** Cavaleiro pixelado montado em camadas (não usa foto estática). */
export default function KnightSprite({ pose = "idle", className = "" }: Props) {
  return (
    <div
      className={`rk-knight-sprite rk-knight-sprite--${pose} ${className}`.trim()}
      role="img"
      aria-label="Cavaleiro"
    >
      <div className="rk-knight-body">
        <div className="rk-knight-cloak" />
        <div className="rk-knight-helm">
          <span className="rk-knight-visor" />
          <span className="rk-knight-breath" />
        </div>
        <div className="rk-knight-pauldron rk-knight-pauldron--l" />
        <div className="rk-knight-pauldron rk-knight-pauldron--r" />
        <div className="rk-knight-torso">
          <span className="rk-knight-trim" />
        </div>
        <div className="rk-knight-arm rk-knight-arm--back">
          <span className="rk-knight-gauntlet" />
        </div>
        <div className="rk-knight-arm rk-knight-arm--front">
          <span className="rk-knight-gauntlet" />
        </div>
        <div className="rk-knight-sword">
          <span className="rk-knight-blade" />
          <span className="rk-knight-guard" />
          <span className="rk-knight-grip" />
          <span className="rk-knight-pommel" />
        </div>
        <div className="rk-knight-hips" />
        <div className="rk-knight-leg rk-knight-leg--l">
          <span className="rk-knight-boot" />
        </div>
        <div className="rk-knight-leg rk-knight-leg--r">
          <span className="rk-knight-boot" />
        </div>
      </div>
      {pose === "attack" && <span className="rk-slash rk-slash--player" />}
    </div>
  );
}
