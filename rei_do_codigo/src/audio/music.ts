import calmaUrl from "../assets/Calma.mp3";

const SETTINGS_KEY = "rk_audio_settings";
const VOLUME_PADRAO = 70;

function volumeSalvo(): number {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return VOLUME_PADRAO;
    const music = JSON.parse(raw)?.music;
    return typeof music === "number" ? music : VOLUME_PADRAO;
  } catch {
    return VOLUME_PADRAO;
  }
}

let audio: HTMLAudioElement | null = null;
let aguardandoInteracao = false;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(calmaUrl);
    audio.loop = true;
    audio.volume = Math.min(100, Math.max(0, volumeSalvo())) / 100;
  }
  return audio;
}

/** Ajusta o volume da música do menu (0 a 100). */
export function setMusicVolume(valor: number) {
  getAudio().volume = Math.min(100, Math.max(0, valor)) / 100;
}

/** Toca a música do menu em loop. Se o navegador bloquear o autoplay,
 *  tenta de novo na primeira interação do usuário. */
export function playMenuMusic() {
  const a = getAudio();
  a.play().catch(() => {
    if (aguardandoInteracao) return;
    aguardandoInteracao = true;
    const retomar = () => {
      window.removeEventListener("pointerdown", retomar);
      window.removeEventListener("keydown", retomar);
      aguardandoInteracao = false;
      a.play().catch(() => {});
    };
    window.addEventListener("pointerdown", retomar);
    window.addEventListener("keydown", retomar);
  });
}

/** Pausa a música do menu (ex.: ao entrar no jogo). */
export function pauseMenuMusic() {
  audio?.pause();
}
