import { useEffect, useRef, useState } from "react";

export type EnemyKnightPose = "idle" | "walk" | "run" | "attack" | "hurt" | "death";

type SheetConfig = {
  src: string;
  frameW: number;
  frameH: number;
  sheetFrames: number;
  frameMs: number;
  loop: boolean;
  sequence?: number[];
};

export const ENEMY_KNIGHT_DISPLAY_SIZE = 340;

const FRAME = { frameW: 128, frameH: 128 } as const;

const SHEETS: Record<EnemyKnightPose, SheetConfig> = {
  idle: { src: "/game/enemy-knight/idle.png", ...FRAME, sheetFrames: 4, frameMs: 175, loop: true },
  walk: { src: "/game/enemy-knight/walk.png", ...FRAME, sheetFrames: 8, frameMs: 100, loop: true },
  run: { src: "/game/enemy-knight/run.png", ...FRAME, sheetFrames: 7, frameMs: 95, loop: true },
  attack: { src: "/game/enemy-knight/attack.png", ...FRAME, sheetFrames: 5, frameMs: 120, loop: false },
  hurt: { src: "/game/enemy-knight/take-hit.png", ...FRAME, sheetFrames: 2, frameMs: 140, loop: false },
  death: { src: "/game/enemy-knight/death.png", ...FRAME, sheetFrames: 6, frameMs: 180, loop: false },
};

function sheetSequence(sheet: SheetConfig): number[] {
  return sheet.sequence ?? Array.from({ length: sheet.sheetFrames }, (_, i) => i);
}

function sheetLayout(sheet: SheetConfig) {
  const scale = ENEMY_KNIGHT_DISPLAY_SIZE / sheet.frameH;
  return {
    scale,
    displayW: ENEMY_KNIGHT_DISPLAY_SIZE,
    displayH: ENEMY_KNIGHT_DISPLAY_SIZE,
    sheetDisplayW: Math.round(sheet.frameW * sheet.sheetFrames * scale),
  };
}

export const ENEMY_KNIGHT_ANIM_MS = {
  idleCycle: SHEETS.idle.sheetFrames * SHEETS.idle.frameMs,
  walkCycle: SHEETS.walk.sheetFrames * SHEETS.walk.frameMs,
  runCycle: SHEETS.run.sheetFrames * SHEETS.run.frameMs,
  attack: sheetSequence(SHEETS.attack).length * SHEETS.attack.frameMs,
  hurt: sheetSequence(SHEETS.hurt).length * SHEETS.hurt.frameMs,
  death: sheetSequence(SHEETS.death).length * SHEETS.death.frameMs,
} as const;

/** Frame do golpe (0 = primeiro) em que o cavaleiro do jogador recebe dano. */
export const ENEMY_KNIGHT_ATTACK_HIT_FRAME = 4;

export const ENEMY_KNIGHT_ATTACK_HIT_MS =
  ENEMY_KNIGHT_ATTACK_HIT_FRAME * SHEETS.attack.frameMs;

type Props = {
  pose?: EnemyKnightPose;
  flipped?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
};

/** Cavaleiro inimigo (3º inimigo): melee com charge/retreat como o goblin. */
export default function EnemyKnightSprite({
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
  const frameOffset = Math.round(frameIndex * sheet.frameW * layout.scale);

  return (
    <div
      className={`rk-enemy-knight-wrap rk-enemy-knight-wrap--${pose}${flipped ? " rk-enemy-knight-wrap--flipped" : ""} ${className}`.trim()}
    >
      <div
        className={`rk-enemy-knight-sprite rk-enemy-knight-sprite--${pose}`}
        role="img"
        aria-label="Cavaleiro inimigo"
        style={{
          backgroundImage: `url(${sheet.src})`,
          backgroundSize: `${layout.sheetDisplayW}px ${layout.displayH}px`,
          backgroundPosition: `-${frameOffset}px bottom`,
        }}
      />
    </div>
  );
}
