import { useEffect, useRef, useState } from "react";

export type KingPose = "idle" | "run" | "attack1" | "attack2" | "attack3" | "hurt" | "death";
export type KingAttackVariant = 1 | 2 | 3;

type SheetConfig = {
  src: string;
  frameW: number;
  frameH: number;
  sheetFrames: number;
  frameMs: number;
  loop: boolean;
  sequence?: number[];
};

export const KING_DISPLAY_SIZE = 340;

const FRAME = { frameW: 160, frameH: 111 } as const;

const SHEETS: Record<KingPose, SheetConfig> = {
  idle: { src: "/game/king/idle.png", ...FRAME, sheetFrames: 8, frameMs: 160, loop: true },
  run: { src: "/game/king/run.png", ...FRAME, sheetFrames: 8, frameMs: 95, loop: true },
  attack1: { src: "/game/king/attack1.png", ...FRAME, sheetFrames: 4, frameMs: 130, loop: false },
  attack2: { src: "/game/king/attack2.png", ...FRAME, sheetFrames: 4, frameMs: 130, loop: false },
  attack3: { src: "/game/king/attack3.png", ...FRAME, sheetFrames: 4, frameMs: 130, loop: false },
  hurt: { src: "/game/king/hurt.png", ...FRAME, sheetFrames: 4, frameMs: 110, loop: false },
  death: {
    src: "/game/king/death.png",
    ...FRAME,
    sheetFrames: 6,
    sequence: [5, 4, 3, 2, 1, 0],
    frameMs: 180,
    loop: false,
  },
};

function sheetSequence(sheet: SheetConfig): number[] {
  return sheet.sequence ?? Array.from({ length: sheet.sheetFrames }, (_, i) => i);
}

function sheetLayout(sheet: SheetConfig) {
  const scale = KING_DISPLAY_SIZE / sheet.frameH;
  return {
    displayW: Math.round(sheet.frameW * scale),
    displayH: KING_DISPLAY_SIZE,
  };
}

function framePosition(frameIndex: number, sheetFrames: number): string {
  const x = sheetFrames <= 1 ? 0 : (frameIndex / (sheetFrames - 1)) * 100;
  return `${x}% 100%`;
}

export const KING_ANIM_MS = {
  idleCycle: sheetSequence(SHEETS.idle).length * SHEETS.idle.frameMs,
  runCycle: sheetSequence(SHEETS.run).length * SHEETS.run.frameMs,
  attack: sheetSequence(SHEETS.attack1).length * SHEETS.attack1.frameMs,
  hurt: sheetSequence(SHEETS.hurt).length * SHEETS.hurt.frameMs,
  death: sheetSequence(SHEETS.death).length * SHEETS.death.frameMs,
} as const;

/** Quadro do corte branco (0 = primeiro) em que o cavaleiro recebe dano. */
export const KING_ATTACK_HIT_FRAME = 1;

export const KING_ATTACK_HIT_MS = KING_ATTACK_HIT_FRAME * SHEETS.attack1.frameMs;

type Props = {
  pose?: KingPose;
  flipped?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
};

export default function KingSprite({
  pose = "idle",
  flipped = false,
  className = "",
  onAnimationComplete,
}: Props) {
  const sheet = SHEETS[pose];
  const layout = sheetLayout(sheet);
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

  return (
    <div
      className={`rk-king-wrap rk-king-wrap--${pose}${flipped ? " rk-king-wrap--flipped" : ""} ${className}`.trim()}
      style={{ width: layout.displayW, height: layout.displayH }}
    >
      <div
        className={`rk-king-sprite rk-king-sprite--${pose}`}
        role="img"
        aria-label="Rei do Código"
        style={{
          width: layout.displayW,
          height: layout.displayH,
          backgroundImage: `url(${sheet.src})`,
          backgroundSize: `${sheet.sheetFrames * 100}% 100%`,
          backgroundPosition: framePosition(frameIndex, sheet.sheetFrames),
        }}
      />
    </div>
  );
}
