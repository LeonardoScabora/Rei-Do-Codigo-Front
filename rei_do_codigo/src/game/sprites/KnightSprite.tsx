import { useEffect, useState } from "react";

export type KnightPose = "idle" | "walk" | "attack" | "jump" | "hurt" | "defeat";

type Props = {
  pose?: KnightPose;
  className?: string;
};

type SheetConfig = {
  src: string;
  frames: number;
  /** milissegundos por frame */
  frameMs: number;
  loop: boolean;
};

const SHEETS: Record<KnightPose, SheetConfig> = {
  idle: { src: "/game/knight/idle.png", frames: 4, frameMs: 175, loop: true },
  walk: { src: "/game/knight/walk.png", frames: 8, frameMs: 100, loop: true },
  attack: { src: "/game/knight/attack-2.png", frames: 4, frameMs: 165, loop: false },
  jump: { src: "/game/knight/jump.png", frames: 6, frameMs: 205, loop: false },
  hurt: { src: "/game/knight/hurt.png", frames: 2, frameMs: 280, loop: false },
  defeat: { src: "/game/knight/hurt.png", frames: 2, frameMs: 280, loop: false },
};

/** Frame do golpe em que a rajada deve sair (0 = primeiro frame). */
export const KNIGHT_ATTACK_BLAST_FRAME = 2;

/** Duração da rajada de energia até o inimigo (teste de ataque à distância). */
export const KNIGHT_BLAST_MS = 520;

/** Durações totais sincronizadas com a lógica de batalha. */
export const KNIGHT_ANIM_MS = {
  idleCycle: SHEETS.idle.frames * SHEETS.idle.frameMs,
  walkCycle: SHEETS.walk.frames * SHEETS.walk.frameMs,
  attack: SHEETS.attack.frames * SHEETS.attack.frameMs,
  attackBlast: KNIGHT_ATTACK_BLAST_FRAME * SHEETS.attack.frameMs,
  jump: SHEETS.jump.frames * SHEETS.jump.frameMs,
  hurt: SHEETS.hurt.frames * SHEETS.hurt.frameMs,
} as const;

function framePosition(frame: number, frames: number): string {
  const x = frames <= 1 ? 0 : (frame / (frames - 1)) * 100;
  return `${x}% 100%`;
}

/**
 * Cavaleiro do jogador via sprite sheets:
 * Idle (loop), Walk (loop), Run_Attack (1x), Jump (retorno), Hurt (1x → Idle).
 */
export default function KnightSprite({ pose = "idle", className = "" }: Props) {
  const sheet = SHEETS[pose];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (pose === "defeat") {
      setFrame(sheet.frames - 1);
      return;
    }

    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      if (current >= sheet.frames) {
        if (sheet.loop) {
          current = 0;
        } else {
          current = sheet.frames - 1;
          window.clearInterval(id);
        }
      }
      setFrame(current);
    }, sheet.frameMs);

    return () => window.clearInterval(id);
  }, [pose, sheet]);

  return (
    <div
      className={`rk-knight-sprite rk-knight-sprite--${pose} ${className}`.trim()}
      role="img"
      aria-label="Cavaleiro"
      style={{
        backgroundImage: `url(${sheet.src})`,
        backgroundSize: `${sheet.frames * 100}% 100%`,
        backgroundPosition: framePosition(frame, sheet.frames),
      }}
    />
  );
}
