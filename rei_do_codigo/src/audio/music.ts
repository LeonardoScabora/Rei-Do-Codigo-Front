import calmaUrl from "../assets/Calma.mp3";
import corridorUrl from "../assets/FallenComrade.mp3";
import kingUrl from "../assets/KingBattle.mp3";

const SETTINGS_KEY = "rk_audio_settings";
const VOLUME_PADRAO = 70;

type Faixa = "menu" | "corredor" | "rei";

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

function volumeNormalizado(valor = volumeSalvo()): number {
  return Math.min(100, Math.max(0, valor)) / 100;
}

let menuAudio: HTMLAudioElement | null = null;
let corridorAudio: HTMLAudioElement | null = null;
let kingAudio: HTMLAudioElement | null = null;
let aguardandoInteracao: Record<Faixa, boolean> = {
  menu: false,
  corredor: false,
  rei: false,
};
let corredorAtivo = false;
let corredorEncerrado = false;
let reiAtivo = false;

function getMenuAudio(): HTMLAudioElement {
  if (!menuAudio) {
    menuAudio = new Audio(calmaUrl);
    menuAudio.loop = true;
    menuAudio.volume = volumeNormalizado();
  }
  return menuAudio;
}

function getCorridorAudio(): HTMLAudioElement {
  if (!corridorAudio) {
    corridorAudio = new Audio(corridorUrl);
    corridorAudio.loop = true;
    corridorAudio.volume = volumeNormalizado();
  }
  return corridorAudio;
}

function getKingAudio(): HTMLAudioElement {
  if (!kingAudio) {
    kingAudio = new Audio(kingUrl);
    kingAudio.loop = true;
    kingAudio.volume = volumeNormalizado();
  }
  return kingAudio;
}

function tentarTocar(audio: HTMLAudioElement, faixa: Faixa) {
  audio.play().catch(() => {
    if (aguardandoInteracao[faixa]) return;
    aguardandoInteracao[faixa] = true;

    const retomar = () => {
      window.removeEventListener("pointerdown", retomar);
      window.removeEventListener("keydown", retomar);
      aguardandoInteracao[faixa] = false;
      audio.play().catch(() => {});
    };
    window.addEventListener("pointerdown", retomar);
    window.addEventListener("keydown", retomar);
  });
}

/** Ajusta o volume de todas as músicas (0 a 100). */
export function setMusicVolume(valor: number) {
  const vol = volumeNormalizado(valor);
  getMenuAudio().volume = vol;
  getCorridorAudio().volume = vol;
  getKingAudio().volume = vol;
}

/** Toca a música do menu em loop. */
export function playMenuMusic() {
  tentarTocar(getMenuAudio(), "menu");
}

/** Pausa a música do menu. */
export function pauseMenuMusic() {
  menuAudio?.pause();
}

/** Prepara as músicas de jogo para uma nova partida. */
export function resetGameMusicSession() {
  corredorEncerrado = false;
  corredorAtivo = false;
  reiAtivo = false;
  corridorAudio?.pause();
  kingAudio?.pause();
}

/** Inicia a música do corredor em loop (do início do jogo até a sala do rei). */
export function playCorridorMusic() {
  if (corredorEncerrado) return;
  corredorAtivo = true;
  tentarTocar(getCorridorAudio(), "corredor");
}

/** Encerra a música do corredor (ex.: ao entrar na sala do rei). */
export function stopCorridorMusic() {
  corredorAtivo = false;
  corredorEncerrado = true;
  corridorAudio?.pause();
}

/** Inicia a música da batalha do rei em loop. */
export function playKingMusic() {
  reiAtivo = true;
  tentarTocar(getKingAudio(), "rei");
}

/** Encerra a música da batalha do rei. */
export function stopKingMusic() {
  reiAtivo = false;
  kingAudio?.pause();
}

/** Pausa a música de jogo durante a transição da coroa. */
export function pauseMusicForCrown() {
  corridorAudio?.pause();
  kingAudio?.pause();
}

/** Retoma a música de jogo após a transição da coroa. */
export function resumeMusicAfterCrown() {
  if (reiAtivo) {
    tentarTocar(getKingAudio(), "rei");
    return;
  }
  if (corredorAtivo) {
    tentarTocar(getCorridorAudio(), "corredor");
  }
}
