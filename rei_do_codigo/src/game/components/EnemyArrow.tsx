import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

type Props = {
  from: Point;
  to: Point;
  durationMs?: number;
  onHit?: () => void;
};

const ARROW_FRAMES = 4;
const ARROW_FRAME_W = 12;
const ARROW_FRAME_MS = 55;
const ARROW_DISPLAY_W = 96;
const ARROW_DISPLAY_H = 24;
const ARROW_SCALE_X = ARROW_DISPLAY_W / ARROW_FRAME_W;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Flecha do arqueiro: sprite animado em linha reta até o cavaleiro. */
export default function EnemyArrow({ from, to, durationMs = 520, onHit }: Props) {
  const [frame, setFrame] = useState(0);
  const [pos, setPos] = useState(from);
  const hitSentRef = useRef(false);
  const sheetDisplayW = ARROW_FRAME_W * ARROW_FRAMES * ARROW_SCALE_X;

  useEffect(() => {
    hitSentRef.current = false;
    setFrame(0);
    setPos(from);

    let frameTick = 0;
    const frameId = window.setInterval(() => {
      frameTick += 1;
      setFrame(frameTick % ARROW_FRAMES);
    }, ARROW_FRAME_MS);

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setPos({
        x: lerp(from.x, to.x, progress),
        y: lerp(from.y, to.y, progress),
      });

      if (progress >= 0.96 && !hitSentRef.current) {
        hitSentRef.current = true;
        onHit?.();
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.clearInterval(frameId);
      cancelAnimationFrame(raf);
    };
  }, [from, to, durationMs, onHit]);

  const offsetX = frame * ARROW_FRAME_W * ARROW_SCALE_X;

  return (
    <div
      className="rk-enemy-arrow"
      aria-hidden
      style={{
        left: pos.x,
        top: pos.y,
        width: ARROW_DISPLAY_W,
        height: ARROW_DISPLAY_H,
      }}
    >
      <img
        src="/game/archer/arrow.png"
        alt=""
        draggable={false}
        style={{
          width: sheetDisplayW,
          height: ARROW_DISPLAY_H,
          left: -offsetX,
        }}
      />
    </div>
  );
}
