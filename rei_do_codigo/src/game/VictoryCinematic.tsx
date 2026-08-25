import { useEffect, useState } from "react";

const IMAGE_SRC = "/game/cena-final.png";
const ZOOM_MS = 6500;
const TEXT_DELAY_MS = 1000;

type Props = {
  onSair: () => void;
  /** Só inicia o zoom quando a coroa já revelou a tela. */
  start?: boolean;
};

export default function VictoryCinematic({ onSair, start = true }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
    img.src = IMAGE_SRC;
  }, []);

  useEffect(() => {
    if (!loaded || !start) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShowText(true);
      return;
    }
    setZooming(true);
    const t = window.setTimeout(() => setShowText(true), ZOOM_MS + TEXT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [loaded, start]);

  return (
    <div className="rk-victory" role="img" aria-label="Vitória no Corredor Real">
      <img
        src={IMAGE_SRC}
        alt=""
        className={`rk-victory__shot${zooming ? " rk-victory__shot--zoom" : ""}${
          showText && !zooming ? " rk-victory__shot--full" : ""
        }`}
        draggable={false}
      />
      {showText && (
        <div className="rk-victory__end">
          <p className="rk-victory__title">
            Você venceu o rei do código e trouxe paz ao reino novamente.
          </p>
          <button type="button" className="rk-back-btn rk-confirm-btn" onClick={onSair}>
            ‹ Voltar ao Menu
          </button>
        </div>
      )}
    </div>
  );
}
