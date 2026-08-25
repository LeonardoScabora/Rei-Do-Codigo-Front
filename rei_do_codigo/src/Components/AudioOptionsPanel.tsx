import { useEffect, useState } from "react";
import { setMusicVolume } from "../audio/music";

export interface AudioSettings {
  music: number;
  sfx: number;
}

export const AUDIO_SETTINGS_KEY = "rk_audio_settings";
const STEP = 10;

export function readAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
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

export default function AudioOptionsPanel() {
  const [settings, setSettings] = useState<AudioSettings>(readAudioSettings);

  useEffect(() => {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    setMusicVolume(settings.music);
  }, [settings]);

  return (
    <>
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
    </>
  );
}
