import { useEffect, useRef, useState } from "react";
import "./Style.css";

const MENU_ITEMS = [
  { key: "new", label: "Novo Jogo", icon: "sword" },
  { key: "load", label: "Carregar Jogo", icon: "save" },
  { key: "options", label: "Opções", icon: "gear" },
] as const;

type IconName = (typeof MENU_ITEMS)[number]["icon"];

function Icon({ name }: { name: IconName }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" as const };
  if (name === "sword") {
    return (
      <svg {...common}>
        <path
          d="M20 3L11 12M20 3l-3 1-1 3M20 3l1 3-3 1M11 12l-6.5 6.5M11 12l1.5 1.5M4.5 18.5L3 20l1.5-.5.5-1.5-1-1z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
  if (name === "save") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="1.6" />
        <rect x="7" y="4" width="10" height="6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="8" y="13" width="8" height="6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="72" height="52" viewBox="0 0 72 52" fill="none" className="rk-crown">
      <path
        d="M6 44 L2 16 L16 28 L24 8 L36 24 L48 8 L56 28 L70 16 L66 44 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
        fill="rgba(80,255,140,0.08)"
      />
      <rect x="6" y="44" width="60" height="5" stroke="currentColor" strokeWidth="3" fill="rgba(80,255,140,0.08)" />
      <circle cx="36" cy="18" r="2.4" fill="currentColor" />
      <circle cx="20" cy="26" r="1.8" fill="currentColor" />
      <circle cx="52" cy="26" r="1.8" fill="currentColor" />
    </svg>
  );
}

function useMatrixRain(canvasRef: React.RefObject<HTMLCanvasElement | null> ) {
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

function Menu() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  useMatrixRain(canvasRef);

  return (
    <div className="rk-root">
      <canvas ref={canvasRef} className="rk-canvas" />
      <div className="rk-vignette" />

      {/* distant castle silhouette */}
      <svg className="rk-skyline" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMax meet">
        <g fill="#04150a" stroke="#1f6b3c" strokeWidth={1}>
          <polygon points="250,300 250,140 265,120 280,140 280,300" />
          <polygon points="280,300 280,110 300,80 320,110 320,300" />
          <rect x="290" y="60" width="20" height="24" />
          <polygon points="320,300 320,150 335,130 350,150 350,300" />
          <polygon points="350,300 350,90 375,55 400,90 400,300" />
          <rect x="380" y="40" width="16" height="20" />
          <polygon points="200,300 200,170 215,150 230,170 230,300" />
          <rect x="0" y="260" width="400" height="40" opacity={0.6} />
        </g>
      </svg>

      {/* kneeling knight silhouette */}
      <svg className="rk-knight" viewBox="0 0 200 220" preserveAspectRatio="xMinYMax meet">
        <g fill="#03110a" stroke="#2a8a4f" strokeWidth={1.5}>
          <rect x="10" y="150" width="8" height="70" />
          <polygon points="6,150 30,150 18,60 10,60" />
          <circle cx="65" cy="90" r="20" />
          <rect x="52" y="105" width="26" height="35" />
          <rect x="40" y="120" width="60" height="60" rx="4" />
          <rect x="30" y="150" width="18" height="55" />
          <rect x="85" y="150" width="18" height="55" />
        </g>
      </svg>

      <div className="rk-content">
        <CrownIcon />
        <h1 className="rk-title">Rei do Código</h1>
        <div className="rk-divider">
          <span className="rk-diamond" />
        </div>

        <nav className="rk-panel" aria-label="Menu principal">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`rk-item${hovered === item.key ? " rk-hovered" : ""}`}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => console.log(`clicked: ${item.key}`)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="rk-fire-wrap">
        <div className="rk-flame" />
        <div className="rk-embers" />
      </div>
    </div>
  );
}

export default Menu;