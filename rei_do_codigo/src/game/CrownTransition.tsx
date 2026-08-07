import { useEffect, useState } from "react";
import CrownIcon from "../Components/CrownIcon";

type Props = {
  active: boolean;
  onDone: () => void;
};

/**
 * Coroa no centro: começa grande, encolhe e a tela fica preta;
 * em seguida revela a próxima tela.
 */
export default function CrownTransition({ active, onDone }: Props) {
  const [phase, setPhase] = useState<"idle" | "shrink" | "hold" | "reveal">("idle");

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }

    setPhase("shrink");
    const t1 = window.setTimeout(() => setPhase("hold"), 1100);
    const t2 = window.setTimeout(() => setPhase("reveal"), 1600);
    const t3 = window.setTimeout(() => onDone(), 2300);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [active, onDone]);

  if (!active && phase === "idle") return null;

  return (
    <div
      className={`rk-crown-transition rk-crown-transition--${phase}`}
      aria-hidden
    >
      <div className="rk-crown-transition__veil" />
      <div className="rk-crown-transition__crown">
        <CrownIcon width={220} height={160} className="rk-crown-transition__svg" />
      </div>
    </div>
  );
}
