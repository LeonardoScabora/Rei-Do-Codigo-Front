import { useEffect, useState } from "react";
import { DIFFICULTIES, type DifficultyKey } from "../difficulty";
import type { LanguageKey } from "../language";

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
          d="M6 11h11v3.2c0 2.4-2 4.3-4.4 4.3H10.4C8 18.5 6 16.6 6 14.2V11z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17 12.2c1.8-.3 3 .5 3 1.8s-1.3 2.4-3 2.1"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 18.6c0 .6 3.1 1 7 1s7-.4 7-1"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M9.5 8.8c-1-1-.9-2 .1-3M13.5 8.8c-1-1-.9-2 .1-3"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
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
      <path
        d="M14 10v4M12.4 10v4M12.4 12h1.6M16.4 10v4M18 10v4M16.4 12H18"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function NewGameScreen({
  onBack,
  onConfirm,
  submitting = false,
  error = null,
}: {
  onBack: () => void;
  onConfirm: (nome: string, lang: LanguageKey, difficulty: DifficultyKey) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<LanguageKey | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyKey | null>(null);
  const [diffHover, setDiffHover] = useState<number | null>(null);
  const [nome, setNome] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowDown") {
        setHoverIndex(null);
        setKeyboardIndex((i) => {
          const current = i ?? 0;
          return (current + 1) % LANGUAGES.length;
        });
      } else if (e.key === "ArrowUp") {
        setHoverIndex(null);
        setKeyboardIndex((i) => {
          const current = i ?? 0;
          return (current - 1 + LANGUAGES.length) % LANGUAGES.length;
        });
      } else if (e.key === "Enter") {
        const activeIdx = hoverIndex ?? keyboardIndex;
        if (selected && difficulty && nome.trim()) {
          confirmSelection();
        } else if (!selected && activeIdx !== null) {
          setSelected(LANGUAGES[activeIdx].key);
        }
      } else if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyboardIndex, hoverIndex, selected, difficulty, nome, onBack]);

  function confirmSelection() {
    if (selected && difficulty && nome.trim() && !submitting) {
      onConfirm(nome.trim(), selected, difficulty);
    }
  }

  const activeIndex = hoverIndex !== null ? hoverIndex : keyboardIndex;
  const canConfirm = Boolean(selected && difficulty && nome.trim() && !submitting);

  return (
    <>
      <div className="rk-panel">
        <div className="rk-subtitle">
          <span className="rk-diamond-sm" /> Escolha sua Linguagem <span className="rk-diamond-sm" />
        </div>

        {LANGUAGES.map((lang, i) => {
          const isActive = activeIndex === i;
          const isSelected = selected === lang.key;

          return (
            <button
              key={lang.key}
              type="button"
              className={`rk-item rk-lang-item${isActive ? " rk-hovered" : ""}${
                isSelected ? " rk-selected" : ""
              }`}
              disabled={submitting}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => {
                setHoverIndex(i);
                setSelected(lang.key);
                setDifficulty(null);
                setNome("");
              }}
            >
              {(isActive || isSelected) && <span className="rk-arrow">▶</span>}
              <LangIcon lang={lang.key} color={lang.color} />
              <span>{lang.label}</span>
            </button>
          );
        })}

        {selected && (
          <div className="rk-difficulty-block">
            <div className="rk-subtitle rk-subtitle-nested">
              <span className="rk-diamond-sm" /> Seu nível <span className="rk-diamond-sm" />
            </div>
            <div className="rk-difficulty-list">
              {DIFFICULTIES.map((diff, i) => {
                const isActive = diffHover === i;
                const isSelected = difficulty === diff.key;
                return (
                  <button
                    key={diff.key}
                    type="button"
                    className={`rk-item rk-diff-item${isActive ? " rk-hovered" : ""}${
                      isSelected ? " rk-selected" : ""
                    }`}
                    disabled={submitting}
                    onMouseEnter={() => setDiffHover(i)}
                    onMouseLeave={() => setDiffHover(null)}
                    onClick={() => setDifficulty(diff.key)}
                  >
                    {(isActive || isSelected) && <span className="rk-arrow">▶</span>}
                    <span className="rk-diff-text">
                      <span>{diff.label}</span>
                      <small>{diff.hint}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selected && difficulty && (
          <div className="rk-name-field rk-name-field-after">
            <label htmlFor="player-name">Nome do guerreiro</label>
            <input
              id="player-name"
              type="text"
              maxLength={40}
              placeholder="Ex: Leo"
              value={nome}
              autoFocus
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canConfirm) confirmSelection();
              }}
              disabled={submitting}
            />
          </div>
        )}
      </div>

      {error && <p className="rk-error">{error}</p>}

      <div className="rk-actions">
        <button type="button" className="rk-back-btn" onClick={onBack} disabled={submitting}>
          ‹ Voltar
        </button>

        {canConfirm && (
          <button type="button" className="rk-back-btn rk-confirm-btn" onClick={confirmSelection}>
            {submitting ? "Criando..." : "Confirmar ›"}
          </button>
        )}
      </div>
    </>
  );
}
