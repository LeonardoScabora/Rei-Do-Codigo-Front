import { useEffect, useState } from "react";

export type LanguageKey = "java" | "python" | "cpp";

const LANGUAGES: { key: LanguageKey; label: string; color: string }[] = [
  { key: "java", label: "Java", color: "#F58219" },
  { key: "python", label: "Python", color: "#4B9FE1" },
  { key: "cpp", label: "C++", color: "#5B8FD6" },
];

function LangIcon({ lang, color }: { lang: LanguageKey; color: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" as const };
  if (lang === "java") {
    return (
      <svg {...common}>
        <path
          d="M8 15c-2 1-2 2.5 1 3.4 3.6 1.1 8.4.4 9.6-1.4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 4c-1.6 1.6-1.4 3 .2 4.4-1.4 1.2-1.4 2.4 0 3.6-1.6 1.2-1.6 2.6 0 4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <ellipse cx="12" cy="16.6" rx="6.4" ry="1.6" stroke={color} strokeWidth="1.3" />
      </svg>
    );
  }
  if (lang === "python") {
    return (
      <svg {...common}>
        <path
          d="M12 3.2c-3.6 0-3.4 1.6-3.4 1.6v1.7h3.5v.5H6.9S4 6.6 4 10.2s2.5 3.5 2.5 3.5H8v-2s-.1-2.5 2.4-2.5h3.4s2.3.03 2.3-2.2V5.4s.3-2.2-3.7-2.2h-.4z"
          stroke={color}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M12 20.8c3.6 0 3.4-1.6 3.4-1.6v-1.7h-3.5v-.5h5.2s2.9.4 2.9-3.2-2.5-3.5-2.5-3.5H16v2s.1 2.5-2.4 2.5H10.2s-2.3-.03-2.3 2.2v2.6s-.3 2.2 3.7 2.2h.4z"
          stroke={color}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="9.2" cy="5.6" r="0.6" fill={color} />
        <circle cx="14.8" cy="18.4" r="0.6" fill={color} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" />
      <path d="M10 9.5c-1.5.6-1.8 4.2 0 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 10v4M12.4 10v4M12.4 12h1.6M16.4 10v4M18 10v4M16.4 12H18" stroke={color} strokeWidth="1.3" strokeLinecap="square" />
    </svg>
  );
}

export default function NewGameScreen({
  onBack,
  onSelectLanguage,
}: {
  onBack: () => void;
  onSelectLanguage: (lang: LanguageKey) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") setIndex((i) => (i + 1) % LANGUAGES.length);
      else if (e.key === "ArrowUp") setIndex((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length);
      else if (e.key === "Enter") onSelectLanguage(LANGUAGES[index].key);
      else if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, onBack, onSelectLanguage]);

  return (
    <>
      <div className="rk-panel">
        <div className="rk-subtitle">
          <span className="rk-diamond-sm" /> Escolha sua Linguagem <span className="rk-diamond-sm" />
        </div>

        {LANGUAGES.map((lang, i) => (
          <button
            key={lang.key}
            type="button"
            className={`rk-item rk-lang-item${index === i ? " rk-hovered" : ""}`}
            onMouseEnter={() => setIndex(i)}
            onClick={() => onSelectLanguage(lang.key)}
          >
            {index === i && <span className="rk-arrow">▶</span>}
            <LangIcon lang={lang.key} color={lang.color} />
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      <button type="button" className="rk-back-btn" onClick={onBack}>
        ‹ Voltar
      </button>

      <p className="rk-hint">[ ↑↓ ] PARA NAVEGAR &nbsp; [ENTER] PARA SELECIONAR &nbsp;</p>
    </>
  );
}