import { useEffect, useRef } from "react";

interface MatrixRainProps {
  className?: string;
  style?: React.CSSProperties;
}

export function useMatrixRain(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let columns = 0;
    let drops: number[] = [];
    const fontSize = 15;
    const chars = "01アイウエオカキクケコサシスセソ0123456789";

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      columns = Math.floor(canvas.offsetWidth / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    }
    resize();
    window.addEventListener("resize", resize);

    let raf: number;
    function draw() {
      if (!canvas || !ctx) return;
      ctx.fillStyle = "rgba(3, 8, 5, 0.14)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const nearHead = Math.random() > 0.93;
        ctx.fillStyle = nearHead ? "rgba(190,255,200,0.9)" : "rgba(60,200,110,0.35)";
        ctx.fillText(text, x, y);
        if (y > canvas.offsetHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.35 + Math.random() * 0.3;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

export function MatrixRain({ className, style }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useMatrixRain(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
    />
  );
}