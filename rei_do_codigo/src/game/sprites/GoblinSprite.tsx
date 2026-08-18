import { useEffect, useRef, useState } from "react";

export type GoblinPose = "idle" | "run" | "attack" | "hurt" | "death";

type SheetConfig = {
  src: string;
  /** Total de frames no arquivo (define o background-size). */
  sheetFrames: number;
  frameMs: number;
  loop: boolean;
  /** Sequência de índices exibidos (padrão: todos os frames do sheet). */
  sequence?: number[];
};

export const GOBLIN_DISPLAY_SIZE = 375;

/** Pixels transparentes abaixo dos pés no frame original (medido nos PNGs). */
const FOOT_PADDING: Record<GoblinPose, { frameH: number; padding: number }> = {
  idle: { frameH: 150, padding: 49 },
  run: { frameH: 128, padding: 42 },
  attack: { frameH: 128, padding: 42 },
  hurt: { frameH: 150, padding: 49 },
  death: { frameH: 150, padding: 49 },
};

function footDropPx(pose: GoblinPose): number {
  const { frameH, padding } = FOOT_PADDING[pose];
  return Math.round(padding * (GOBLIN_DISPLAY_SIZE / frameH));
}

const SHEETS: Record<GoblinPose, SheetConfig> = {
  idle: { src: "/game/goblin/idle.png", sheetFrames: 4, frameMs: 175, loop: true },
  run: { src: "/game/goblin/run.png", sheetFrames: 8, frameMs: 95, loop: true },
  attack: {
    src: "/game/goblin/attack.png",
    sheetFrames: 8,
    sequence: [0, 1],
    frameMs: 140,
    loop: false,
  },
  hurt: { src: "/game/goblin/take-hit.png", sheetFrames: 4, frameMs: 110, loop: false },
  death: {
    src: "/game/goblin/death.png",
    sheetFrames: 4,
    sequence: [3, 2, 1, 0],
    frameMs: 180,
    loop: false,
  },
};

function sheetSequence(sheet: SheetConfig): number[] {
  return sheet.sequence ?? Array.from({ length: sheet.sheetFrames }, (_, i) => i);
}

export const GOBLIN_ANIM_MS = {
  idleCycle: SHEETS.idle.sheetFrames * SHEETS.idle.frameMs,
  runCycle: SHEETS.run.sheetFrames * SHEETS.run.frameMs,
  attack: sheetSequence(SHEETS.attack).length * SHEETS.attack.frameMs,
  hurt: sheetSequence(SHEETS.hurt).length * SHEETS.hurt.frameMs,
  death: sheetSequence(SHEETS.death).length * SHEETS.death.frameMs,
} as const;

type Props = {
  pose?: GoblinPose;
  flipped?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
};

function framePosition(frameIndex: number, sheetFrames: number): string {
  const x = sheetFrames <= 1 ? 0 : (frameIndex / (sheetFrames - 1)) * 100;
  return `${x}% 100%`;
}

export default function GoblinSprite({
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
      className={`rk-goblin-wrap rk-goblin-wrap--${pose}${flipped ? " rk-goblin-wrap--flipped" : ""} ${className}`.trim()}
      style={{ bottom: `-${footDrop}px` }}
    >
      <div
        className={`rk-goblin-sprite rk-goblin-sprite--${pose}`}
        role="img"
        aria-label="Goblin"
        style={{
          backgroundImage: `url(${sheet.src})`,
          backgroundSize: `${sheet.sheetFrames * 100}% 100%`,
          backgroundPosition: framePosition(frameIndex, sheet.sheetFrames),
        }}
      />
    </div>
  );
}
