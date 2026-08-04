import { useEffect, useState } from "react";

interface SaveSlot {
  id: string;
  language: string;
  level: number;
  updatedAt: string;
}

const SAVES_KEY = "rk_saves";

function readSaves(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LoadGameScreen({ onBack }: { onBack: () => void }) {
  const [saves, setSaves] = useState<SaveSlot[]>([]);

  useEffect(() => {
    setSaves(readSaves());
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack]);

  const handleLoad = (slot: SaveSlot) => {
    // TODO: carregar o estado real do jogo a partir do slot
    console.log("Carregando save:", slot);
  };

  const handleDelete = (id: string) => {
    const next = saves.filter((s) => s.id !== id);
    setSaves(next);
    localStorage.setItem(SAVES_KEY, JSON.stringify(next));
  };

  return (
    <>
      <div className="rk-panel">
        <div className="rk-subtitle">
          <span className="rk-diamond-sm" /> Carregar Jogo <span className="rk-diamond-sm" />
        </div>

        {saves.length === 0 ? (
          <p className="rk-save-empty">Nenhum jogo salvo encontrado.</p>
        ) : (
          saves.map((slot) => (
            <div key={slot.id} className="rk-save-item">
              <div className="rk-save-info" onClick={() => handleLoad(slot)}>
                <span className="rk-save-lang">{slot.language}</span>
                <span className="rk-save-meta">
                  Nível {slot.level} · {formatDate(slot.updatedAt)}
                </span>
              </div>
              <button
                type="button"
                className="rk-save-delete"
                aria-label="Excluir save"
                onClick={() => handleDelete(slot.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <button type="button" className="rk-back-btn" onClick={onBack}>
        ‹ Voltar
      </button>
    </>
  );
}