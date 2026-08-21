import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

type Props = {
  from: Point;
  to: Point;
  onHit?: () => void;
  onComplete?: () => void;
};

const CHARGE2_FRAMES = 9;
const CHARGE2_FRAME_W = 64;
const CHARGE2_FRAME_H = 128;
const CHARGE2_FRAME_MS = 95;
const CHARGE2_DASHES = 6;
const CHARGE2_STAGGER_MS = 120;
const CHARGE2_DISPLAY_W = 88;
const CHARGE2_DISPLAY_H = 176;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Magia do mago: após o Attack, o Charge2 segue em tracejado até o cavaleiro. */
export default function MageMagic({ from, to, onHit, onComplete }: Props) {
  const [trailBorn, setTrailBorn] = useState(0);
  const [trailFrame, setTrailFrame] = useState(0);
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
    setTrailBorn(1);
    setTrailFrame(0);

    let born = 1;
    const spawnId = window.setInterval(() => {
      born += 1;
      setTrailBorn(born);
      if (born >= CHARGE2_DASHES) {
        window.clearInterval(spawnId);
        if (!hitSentRef.current) {
          hitSentRef.current = true;
          onHitRef.current?.();
        }
      }
    }, CHARGE2_STAGGER_MS);

    let frameTick = 0;
    const trailDuration =
      (CHARGE2_DASHES - 1) * CHARGE2_STAGGER_MS + CHARGE2_FRAMES * CHARGE2_FRAME_MS;
    const frameId = window.setInterval(() => {
      frameTick += 1;
      setTrailFrame(Math.min(frameTick, CHARGE2_FRAMES - 1));
    }, CHARGE2_FRAME_MS);
    const doneId = window.setTimeout(() => {
      if (!completeSentRef.current) {
        completeSentRef.current = true;
        onCompleteRef.current?.();
      }
    }, trailDuration);

    return () => {
      window.clearInterval(spawnId);
      window.clearInterval(frameId);
      window.clearTimeout(doneId);
    };
  }, [from, to]);

  const charge2Scale = CHARGE2_DISPLAY_H / CHARGE2_FRAME_H;
  const charge2SheetW = CHARGE2_FRAME_W * CHARGE2_FRAMES * charge2Scale;

  return (
    <>
      {Array.from({ length: trailBorn }, (_, i) => {
        const t = CHARGE2_DASHES <= 1 ? 1 : i / (CHARGE2_DASHES - 1);
        const pos = lerpPoint(from, to, t);
        const dashFrame = Math.min(trailFrame, CHARGE2_FRAMES - 1);
        return (
          <div
            key={i}
            className="rk-mage-trail"
            aria-hidden
            style={{
              left: pos.x,
              top: pos.y,
              width: CHARGE2_DISPLAY_W,
              height: CHARGE2_DISPLAY_H,
              opacity: 0.45 + (i / Math.max(1, CHARGE2_DASHES - 1)) * 0.55,
            }}
          >
            <div
              className="rk-mage-trail__sheet"
              style={{
                width: CHARGE2_DISPLAY_W,
                height: CHARGE2_DISPLAY_H,
                backgroundImage: "url(/game/mage/charge2.png)",
                backgroundSize: `${charge2SheetW}px ${CHARGE2_DISPLAY_H}px`,
                backgroundPosition: `-${Math.round(dashFrame * CHARGE2_FRAME_W * charge2Scale)}px center`,
              }}
            />
          </div>
        );
      })}
    </>
  );
}

export const MAGE_MAGIC_MS = {
  charge2: (CHARGE2_DASHES - 1) * CHARGE2_STAGGER_MS + CHARGE2_FRAMES * CHARGE2_FRAME_MS,
} as const;
