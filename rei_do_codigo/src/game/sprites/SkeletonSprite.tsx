import { useEffect, useRef, useState } from "react";

export type SkeletonPose = "idle" | "run" | "attack" | "hurt" | "death";

type SheetConfig = {
  src: string;
  sheetFrames: number;
  frameMs: number;
  loop: boolean;
  sequence?: number[];
};

export const SKELETON_DISPLAY_SIZE = 375;

const FOOT_PADDING: Record<SkeletonPose, { frameH: number; padding: number }> = {
  idle: { frameH: 150, padding: 49 },
  run: { frameH: 150, padding: 49 },
  attack: { frameH: 128, padding: 42 },
  hurt: { frameH: 150, padding: 49 },
  death: { frameH: 150, padding: 49 },
};

function footDropPx(pose: SkeletonPose): number {
  const { frameH, padding } = FOOT_PADDING[pose];
  return Math.round(padding * (SKELETON_DISPLAY_SIZE / frameH));
}

const SHEETS: Record<SkeletonPose, SheetConfig> = {
  idle: { src: "/game/skeleton/idle.png", sheetFrames: 4, frameMs: 175, loop: true },
  run: {
    src: "/game/skeleton/walk.png",
    sheetFrames: 4,
    sequence: [3, 2, 1, 0],
    frameMs: 120,
    loop: true,
  },
  attack: { src: "/game/skeleton/attack.png", sheetFrames: 8, frameMs: 100, loop: false },
  hurt: { src: "/game/skeleton/take-hit.png", sheetFrames: 4, frameMs: 110, loop: false },
  death: {
    src: "/game/skeleton/death.png",
    sheetFrames: 4,
    sequence: [3, 2, 1, 0],
    frameMs: 180,
    loop: false,
  },
};

function sheetSequence(sheet: SheetConfig): number[] {
  return sheet.sequence ?? Array.from({ length: sheet.sheetFrames }, (_, i) => i);
}

export const SKELETON_ANIM_MS = {
  idleCycle: SHEETS.idle.sheetFrames * SHEETS.idle.frameMs,
  runCycle: SHEETS.run.sheetFrames * SHEETS.run.frameMs,
  attack: sheetSequence(SHEETS.attack).length * SHEETS.attack.frameMs,
  hurt: sheetSequence(SHEETS.hurt).length * SHEETS.hurt.frameMs,
  death: sheetSequence(SHEETS.death).length * SHEETS.death.frameMs,
} as const;

export const SKELETON_ATTACK_HIT_MS = 4 * SHEETS.attack.frameMs;

type Props = {
  pose?: SkeletonPose;
  flipped?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
};

function framePosition(frameIndex: number, sheetFrames: number): string {
  const x = sheetFrames <= 1 ? 0 : (frameIndex / (sheetFrames - 1)) * 100;
  return `${x}% 100%`;
}

/** Esqueleto guerreiro (2º inimigo): sprites espelhados, comportamento de melee. */
export default function SkeletonSprite({
  pose = "idle",
  flipped = false,
  className = "",
  onAnimationComplete,
}: Props) {
  const sheet = SHEETS[pose];
  const sequence = sheetSequence(sheet);
  const [step, setStep] = useState(0);
  const onCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    setStep(0);
    let current = 0;

    const id = window.setInterval(() => {
      current += 1;
      if (current >= sequence.length) {
        if (sheet.loop) {
          current = 0;
        } else {
          current = sequence.length - 1;
          window.clearInterval(id);
          onCompleteRef.current?.();
        }
      }
      setStep(current);
    }, sheet.frameMs);

    return () => window.clearInterval(id);
  }, [pose, sheet, sequence.length]);

  const frameIndex = sequence[step] ?? 0;
  const footDrop = footDropPx(pose);

  return (
    <div
      className={`rk-skeleton-wrap rk-skeleton-wrap--${pose}${flipped ? " rk-skeleton-wrap--flipped" : ""} ${className}`.trim()}
      style={{ bottom: `-${footDrop}px` }}
    >
      <div
        className={`rk-skeleton-sprite rk-skeleton-sprite--${pose}`}
        role="img"
        aria-label="Esqueleto guerreiro"
        style={{
          backgroundImage: `url(${sheet.src})`,
          backgroundSize: `${sheet.sheetFrames * 100}% 100%`,
          backgroundPosition: framePosition(frameIndex, sheet.sheetFrames),
        }}
      />
    </div>
  );
}
