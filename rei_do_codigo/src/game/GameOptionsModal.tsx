import { useEffect } from "react";
import AudioOptionsPanel from "../Components/AudioOptionsPanel";
import GearIcon from "../Components/GearIcon";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GameOptionsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="rk-game-options-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="rk-game-options-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rk-game-options-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rk-game-options-modal__header">
          <span className="rk-game-options-modal__icon" aria-hidden>
            <GearIcon size={20} />
          </span>
          <h2 id="rk-game-options-title" className="rk-game-options-modal__title">
            Opções
          </h2>
        </div>

        <div className="rk-game-options-modal__body">
          <AudioOptionsPanel />
        </div>

        <div className="rk-game-options-modal__actions">
          <button type="button" className="rk-menu-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
