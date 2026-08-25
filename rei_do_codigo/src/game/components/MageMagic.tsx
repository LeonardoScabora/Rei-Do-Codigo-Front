import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

type Props = {
  from: Point;
  to: Point;
  onHit?: () => void;
  onComplete?: () => void;
};

const CHARGE2_FRAMES = 9;
const CHARGE2_FRAME_MS = 70;
const CHARGE2_TRAVEL_MS = 720;
const CHARGE2_DISPLAY_W = 96;
const CHARGE2_DISPLAY_H = 96;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function framePosition(frameIndex: number, sheetFrames: number): string {
  const x = sheetFrames <= 1 ? 0 : (frameIndex / (sheetFrames - 1)) * 100;
  return `${x}% 50%`;
}

/** Magia do mago: um único projétil Charge2 viaja até o cavaleiro, como um tiro. */
export default function MageMagic({ from, to, onHit, onComplete }: Props) {
  const [pos, setPos] = useState(from);
  const [frame, setFrame] = useState(0);
  const hitSentRef = useRef(false);
  const completeSentRef = useRef(false);
  const onHitRef = useRef(onHit);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onHitRef.current = onHit;
    onCompleteRef.current = onComplete;
  }, [onHit, onComplete]);

  useEffect(() => {
    hitSentRef.current = false;
    completeSentRef.current = false;
    setPos(from);
    setFrame(0);

    let frameTick = 0;
    const frameId = window.setInterval(() => {
      frameTick += 1;
      setFrame(frameTick % CHARGE2_FRAMES);
    }, CHARGE2_FRAME_MS);

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / CHARGE2_TRAVEL_MS);
      setPos(lerpPoint(from, to, progress));

      if (progress >= 0.96 && !hitSentRef.current) {
        hitSentRef.current = true;
        onHitRef.current?.();
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      window.clearInterval(frameId);
      if (!completeSentRef.current) {
        completeSentRef.current = true;
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.clearInterval(frameId);
      cancelAnimationFrame(raf);
    };
  }, [from, to]);

  return (
    <div
      className="rk-mage-bolt"
      aria-hidden
      style={{
        left: pos.x,
        top: pos.y,
        width: CHARGE2_DISPLAY_W,
        height: CHARGE2_DISPLAY_H,
      }}
    >
      <div
        className="rk-mage-bolt__sheet"
        style={{
          width: CHARGE2_DISPLAY_W,
          height: CHARGE2_DISPLAY_H,
          backgroundImage: "url(/game/mage/charge2.png)",
          backgroundSize: `${CHARGE2_FRAMES * 100}% 200%`,
          backgroundPosition: framePosition(frame, CHARGE2_FRAMES),
        }}
      />
    </div>
  );
}

export const MAGE_MAGIC_MS = {
  charge2: CHARGE2_TRAVEL_MS,
} as const;
