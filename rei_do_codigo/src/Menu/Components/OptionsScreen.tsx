import { useEffect } from "react";
import AudioOptionsPanel from "../../Components/AudioOptionsPanel";

export default function OptionsScreen({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack]);

  return (
    <>
      <div className="rk-panel">
        <div className="rk-subtitle">
          <span className="rk-diamond-sm" /> Opções <span className="rk-diamond-sm" />
        </div>

        <AudioOptionsPanel />
      </div>

      <div className="rk-actions">
        <button type="button" className="rk-back-btn" onClick={onBack}>
          ‹ Voltar
        </button>
      </div>
    </>
  );
}
