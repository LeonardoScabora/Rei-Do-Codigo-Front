import { useEffect, useRef, useState } from "react";

export type ArcherPose = "idle" | "walk" | "shot" | "hurt" | "death";

type SheetConfig = {
  src: string;
  frameW: number;
  frameH: number;
  sheetFrames: number;
  frameMs: number;
  loop: boolean;
  displayH: number;
  footPadding?: number;
  sequence?: number[];
};

const DISPLAY = 384;

const SHEETS: Record<ArcherPose, SheetConfig> = {
  idle: {
    src: "/game/archer/idle.png",
    frameW: 128,
    frameH: 128,
    sheetFrames: 7,
    frameMs: 140,
    loop: true,
    displayH: DISPLAY,
    footPadding: 0,
  },
  walk: {
    src: "/game/archer/walk.png",
    frameW: 128,
    frameH: 128,
    sheetFrames: 8,
    frameMs: 100,
    loop: true,
    displayH: DISPLAY,
    footPadding: 1,
  },
  shot: {
    src: "/game/archer/shot.png?v=3",
    frameW: 64,
    frameH: 128,
    sheetFrames: 16,
    frameMs: 75,
    loop: false,
    displayH: DISPLAY,
    footPadding: 0,
  },
  hurt: {
    src: "/game/archer/hurt.png",
    frameW: 128,
    frameH: 128,
    sheetFrames: 2,
    frameMs: 120,
    loop: false,
    displayH: DISPLAY,
    footPadding: 0,
  },
  death: {
    src: "/game/archer/dead.png",
    frameW: 128,
    frameH: 128,
    sheetFrames: 5,
    frameMs: 200,
    loop: false,
    displayH: DISPLAY,
    footPadding: 0,
    sequence: [4, 3, 2, 1, 0],
  },
};

function sheetSequence(sheet: SheetConfig): number[] {
  return sheet.sequence ?? Array.from({ length: sheet.sheetFrames }, (_, i) => i);
}

function sheetLayout(sheet: SheetConfig) {
  const scale = sheet.displayH / sheet.frameH;
  return {
    scale,
    displayW: Math.round(sheet.frameW * scale),
    displayH: sheet.displayH,
    sheetDisplayW: Math.round(sheet.frameW * sheet.sheetFrames * scale),
    footDrop: Math.round((sheet.footPadding ?? 0) * scale),
  };
}

export const ARCHER_DISPLAY_H = DISPLAY;

export const ARCHER_ANIM_MS = {
  idleCycle: SHEETS.idle.sheetFrames * SHEETS.idle.frameMs,
  walkCycle: SHEETS.walk.sheetFrames * SHEETS.walk.frameMs,
  shot: sheetSequence(SHEETS.shot).length * SHEETS.shot.frameMs,
  hurt: sheetSequence(SHEETS.hurt).length * SHEETS.hurt.frameMs,
  death: sheetSequence(SHEETS.death).length * SHEETS.death.frameMs,
} as const;

type Props = {
  pose?: ArcherPose;
  className?: string;
  onAnimationComplete?: () => void;
};

/** Esqueleto arqueiro (2º inimigo): Idle, Walk, Shot, Hurt, Dead. */
export default function ArcherSprite({
  pose = "idle",
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
      className={`rk-archer-wrap rk-archer-wrap--${pose} ${className}`.trim()}
      style={{
        width: layout.displayW,
        height: layout.displayH,
        bottom: `-${layout.footDrop}px`,
      }}
    >
      <div
        className={`rk-archer-sprite rk-archer-sprite--${pose}`}
        role="img"
        aria-label="Esqueleto arqueiro"
        style={{
          width: layout.displayW,
          height: layout.displayH,
          backgroundImage: `url(${sheet.src})`,
          backgroundSize: `${layout.sheetDisplayW}px ${layout.displayH}px`,
          backgroundPosition: `-${Math.round(frameIndex * sheet.frameW * layout.scale)}px bottom`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
