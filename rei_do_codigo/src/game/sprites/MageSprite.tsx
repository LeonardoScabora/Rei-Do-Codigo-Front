import { useEffect, useRef, useState } from "react";

export type MagePose = "idle" | "walk" | "attack" | "hurt" | "death";

type SheetConfig = {
  src: string;
  frameW: number;
  frameH: number;
  sheetFrames: number;
  frameMs: number;
  loop: boolean;
  sequence?: number[];
};

export const MAGE_DISPLAY_SIZE = 340;

const FRAME = { frameW: 128, frameH: 128 } as const;

const SHEETS: Record<MagePose, SheetConfig> = {
  idle: { src: "/game/mage/idle.png", ...FRAME, sheetFrames: 8, frameMs: 160, loop: true },
  walk: {
    src: "/game/mage/walk.png",
    ...FRAME,
    sheetFrames: 7,
    sequence: [6, 5, 4, 3, 2, 1, 0],
    frameMs: 110,
    loop: true,
  },
  attack: {
    src: "/game/mage/attack.png?v=7",
    ...FRAME,
    sheetFrames: 9,
    frameMs: 80,
    loop: false,
  },
  hurt: { src: "/game/mage/hurt.png", ...FRAME, sheetFrames: 4, frameMs: 110, loop: false },
  death: {
    src: "/game/mage/death.png",
    ...FRAME,
    sheetFrames: 4,
    sequence: [3, 2, 1, 0],
    frameMs: 180,
    loop: false,
  },
};

function sheetSequence(sheet: SheetConfig): number[] {
  return sheet.sequence ?? Array.from({ length: sheet.sheetFrames }, (_, i) => i);
}

function sheetLayout(sheet: SheetConfig) {
  const scale = MAGE_DISPLAY_SIZE / sheet.frameH;
  return {
    displayW: Math.round(sheet.frameW * scale),
    displayH: MAGE_DISPLAY_SIZE,
  };
}

function framePosition(frameIndex: number, sheetFrames: number): string {
  const x = sheetFrames <= 1 ? 0 : (frameIndex / (sheetFrames - 1)) * 100;
  return `${x}% 100%`;
}

export const MAGE_ANIM_MS = {
  idleCycle: sheetSequence(SHEETS.idle).length * SHEETS.idle.frameMs,
  walkCycle: sheetSequence(SHEETS.walk).length * SHEETS.walk.frameMs,
  attack: sheetSequence(SHEETS.attack).length * SHEETS.attack.frameMs,
  hurt: sheetSequence(SHEETS.hurt).length * SHEETS.hurt.frameMs,
  death: sheetSequence(SHEETS.death).length * SHEETS.death.frameMs,
} as const;

type Props = {
  pose?: MagePose;
  flipped?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
};

/** Mago dos Vetores (4º inimigo): idle/walk/hurt/death iguais aos outros; ataque dispara magia no lugar. */
export default function MageSprite({
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
      className={`rk-mage-wrap rk-mage-wrap--${pose}${flipped ? " rk-mage-wrap--flipped" : ""} ${className}`.trim()}
      style={{ width: layout.displayW, height: layout.displayH }}
    >
      <div
        className={`rk-mage-sprite rk-mage-sprite--${pose}`}
        role="img"
        aria-label="Mago"
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
