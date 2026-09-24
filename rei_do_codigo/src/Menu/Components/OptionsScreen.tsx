import { useEffect } from "react";
import AudioOptionsPanel from "../../Components/AudioOptionsPanel";
import { MenuBanner, MenuFrame } from "./MenuChrome";

export default function OptionsScreen({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack]);

  return (
    <MenuFrame label="Opções">
      <div className="rk-subtitle">
        <span className="rk-diamond-sm" /> Opções <span className="rk-diamond-sm" />
      </div>

      <AudioOptionsPanel />

      <div className="rk-menu-actions">
        <MenuBanner chevron="left" onClick={onBack}>
          Voltar
        </MenuBanner>
      </div>
    </MenuFrame>
  );
}
