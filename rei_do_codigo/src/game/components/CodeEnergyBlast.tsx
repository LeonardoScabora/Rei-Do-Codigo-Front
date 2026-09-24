import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

type Props = {
  from: Point;
  to: Point;
  durationMs: number;
  onHit?: () => void;
};

const CHARS = "01{}</>[]=+-*&|#アイウエオカキクケコサシスセソ";

function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function transformLocal(local: Point, angle: number, origin: Point): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: origin.x + local.x * cos - local.y * sin,
    y: origin.y + local.x * sin + local.y * cos,
  };
}

function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Rajada em linha reta; os símbolos formam o contorno ")" e avançam juntos até o inimigo.
 */
export default function CodeEnergyBlast({ from, to, durationMs, onHit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitSentRef = useRef(false);

  useEffect(() => {
    hitSentRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const fontSize = 16;
    const heightHalf = 85;
    const bulge = 55;
    const curveSteps = 25;
    const depthLayers = 9;
    const trailCopies = 8;
    const sparkCount = 18;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * devicePixelRatio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const drawParenBurst = (center: Point, fade: number, tick: number, seedBase: number) => {
      for (let layer = 0; layer < depthLayers; layer += 1) {
        const layerScale = 1 - layer * 0.11;
        const layerFade = fade * (1 - layer * 0.12);

        for (let i = 0; i <= curveSteps; i += 1) {
          const u = i / curveSteps;
          const localY = (u - 0.5) * 2 * heightHalf * layerScale;
          const localX = bulge * layerScale * Math.sin(Math.PI * u);

          const thickness = (hash(seedBase + i + layer) - 0.5) * 5;
          const local = {
            x: localX + thickness * 0.25,
            y: localY + thickness,
          };
          const pt = transformLocal(local, angle, center);

          const char = CHARS[Math.floor(hash(seedBase + i * 9 + layer * 17 + tick) * CHARS.length)];
          const edge = Math.sin(Math.PI * u);
          const alpha = layerFade * (0.35 + edge * 0.65);
          const bright = layer === 0 && edge > 0.82;

          ctx.fillStyle = bright
            ? `rgba(225, 255, 235, ${alpha})`
            : `rgba(45, 210, 110, ${alpha * 0.88})`;
          ctx.fillText(char, pt.x, pt.y);
        }
      }
    };

    resize();
    const start = performance.now();
    let raf = 0;
    let tick = 0;

    const draw = (now: number) => {
      tick += 1;
      const rect = parent.getBoundingClientRect();
      const progress = Math.min(1, (now - start) / durationMs);

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const head = lerp(from, to, progress);
      drawParenBurst(head, 1, tick, 100);

      for (let trail = 1; trail <= trailCopies; trail += 1) {
        const trailT = progress - trail * 0.055;
        if (trailT <= 0) continue;

        const center = lerp(from, to, trailT);
        const fade = 1 - trail / (trailCopies + 0.5);
        drawParenBurst(center, fade * 0.75, tick, 200 + trail * 50);
      }

      for (let i = 0; i < sparkCount; i += 1) {
        const u = hash(i + tick * 0.3);
        const local = {
          x: bulge * Math.sin(Math.PI * u) * (0.4 + hash(i) * 0.5),
          y: (u - 0.5) * 2 * heightHalf * 0.85,
        };
        const pt = transformLocal(local, angle, head);
        const char = CHARS[Math.floor(hash(i + tick * 3) * CHARS.length)];

        ctx.fillStyle = `rgba(200, 255, 215, ${0.4 + hash(i + tick) * 0.45})`;
        ctx.fillText(char, pt.x, pt.y);
      }

      if (progress >= 0.92 && !hitSentRef.current) {
        hitSentRef.current = true;
        onHit?.();
      }

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs, onHit]);

  return <canvas className="rk-energy-blast" ref={canvasRef} aria-hidden />;
}