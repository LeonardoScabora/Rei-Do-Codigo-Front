import { useEffect, useState } from "react";
import { setMusicVolume } from "../../audio/music";

interface AudioSettings {
  music: number;
  sfx: number;
}

const SETTINGS_KEY = "rk_audio_settings";
const STEP = 10;

function readSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { music: 70, sfx: 80 };
    return JSON.parse(raw);
  } catch {
    return { music: 70, sfx: 80 };
  }
}

function VolumeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const blocks = 10;
  const filled = Math.round((value / 100) * blocks);

  return (
    <div className="rk-option-row">
      <span className="rk-option-label">{label}</span>
      <div className="rk-vol-control">
        <button
          type="button"
          className="rk-vol-btn"
          onClick={() => onChange(Math.max(0, value - STEP))}
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <div className="rk-vol-bar" aria-hidden="true">
          {Array.from({ length: blocks }).map((_, i) => (
            <span key={i} className={`rk-vol-block${i < filled ? " rk-vol-block-filled" : ""}`} />
          ))}
        </div>
        <button
          type="button"
          className="rk-vol-btn"
          onClick={() => onChange(Math.min(100, value + STEP))}
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
        <span className="rk-vol-value">{value}%</span>
      </div>
    </div>
  );
}

export default function OptionsScreen({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<AudioSettings>(readSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setMusicVolume(settings.music);
  }, [settings]);

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

        <VolumeRow
          label="Música"
          value={settings.music}
          onChange={(v) => setSettings((s) => ({ ...s, music: v }))}
        />
        <VolumeRow
          label="Efeitos"
          value={settings.sfx}
          onChange={(v) => setSettings((s) => ({ ...s, sfx: v }))}
        />
      </div>

      <div className="rk-actions">
        <button type="button" className="rk-back-btn" onClick={onBack}>
          ‹ Voltar
        </button>
      </div>
    </>
  );
}