import { useEffect, useRef, useState } from "react";
import { pauseMusicForCrown, resumeMusicAfterCrown } from "../audio/music";
import CrownIcon from "../Components/CrownIcon";

type Props = {
  active: boolean;
  /** A próxima cena já está montada atrás do véu; pode revelar. */
  sceneReady?: boolean;
  /** Tela coberta de preto — troque o cenário agora. */
  onCovered?: () => void;
  onDone: () => void;
};

/**
 * Coroa no centro: começa grande, encolhe e a tela fica preta.
 * Só revela quando a próxima cena estiver pronta atrás do véu.
 */
export default function CrownTransition({
  active,
  sceneReady = true,
  onCovered,
  onDone,
}: Props) {
  const [phase, setPhase] = useState<"idle" | "shrink" | "hold" | "reveal">("idle");
  const coveredOnce = useRef(false);
  const onCoveredRef = useRef(onCovered);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onCoveredRef.current = onCovered;
  }, [onCovered]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      coveredOnce.current = false;
      return;
    }

    pauseMusicForCrown();
    setPhase("shrink");
    const t1 = window.setTimeout(() => {
      setPhase("hold");
      if (!coveredOnce.current) {
        coveredOnce.current = true;
        onCoveredRef.current?.();
      }
    }, 1100);

    return () => window.clearTimeout(t1);
  }, [active]);

  useEffect(() => {
    if (!active || phase !== "hold" || !sceneReady) return;
    const tReveal = window.setTimeout(() => setPhase("reveal"), 280);
    return () => window.clearTimeout(tReveal);
  }, [active, phase, sceneReady]);

  useEffect(() => {
    if (!active || phase !== "reveal") return;
    const tDone = window.setTimeout(() => {
      resumeMusicAfterCrown();
      onDoneRef.current();
    }, 750);
    return () => window.clearTimeout(tDone);
  }, [active, phase]);

  if (!active && phase === "idle") return null;

  const displayPhase = active && phase === "idle" ? "shrink" : phase;

  return (
    <div
      className={`rk-crown-transition rk-crown-transition--${displayPhase}`}
      aria-hidden
    >
      <div className="rk-crown-transition__veil" />
      <div className="rk-crown-transition__crown">
        <CrownIcon width={220} height={160} className="rk-crown-transition__svg" />
      </div>
    </div>
  );
}
