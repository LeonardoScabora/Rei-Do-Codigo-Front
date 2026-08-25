import calmaUrl from "../assets/Calma.mp3";
import corridorUrl from "../assets/FallenComrade.mp3";

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

function volumeNormalizado(valor = volumeSalvo()): number {
  return Math.min(100, Math.max(0, valor)) / 100;
}

let menuAudio: HTMLAudioElement | null = null;
let corridorAudio: HTMLAudioElement | null = null;
let aguardandoInteracaoMenu = false;
let aguardandoInteracaoCorredor = false;
let corredorAtivo = false;
let corredorEncerrado = false;

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

function tentarTocar(audio: HTMLAudioElement, tipo: "menu" | "corredor") {
  audio.play().catch(() => {
    const aguardando = tipo === "menu" ? aguardandoInteracaoMenu : aguardandoInteracaoCorredor;
    if (aguardando) return;

    if (tipo === "menu") aguardandoInteracaoMenu = true;
    else aguardandoInteracaoCorredor = true;

    const retomar = () => {
      window.removeEventListener("pointerdown", retomar);
      window.removeEventListener("keydown", retomar);
      if (tipo === "menu") aguardandoInteracaoMenu = false;
      else aguardandoInteracaoCorredor = false;
      audio.play().catch(() => {});
    };
    window.addEventListener("pointerdown", retomar);
    window.addEventListener("keydown", retomar);
  });
}

/** Ajusta o volume das músicas do menu e do corredor (0 a 100). */
export function setMusicVolume(valor: number) {
  const vol = volumeNormalizado(valor);
  getMenuAudio().volume = vol;
  getCorridorAudio().volume = vol;
}

/** Toca a música do menu em loop. */
export function playMenuMusic() {
  tentarTocar(getMenuAudio(), "menu");
}

/** Pausa a música do menu. */
export function pauseMenuMusic() {
  menuAudio?.pause();
}

/** Prepara a música do corredor para uma nova partida. */
export function resetCorridorMusicSession() {
  corredorEncerrado = false;
  corredorAtivo = false;
  corridorAudio?.pause();
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

/** Pausa a música do corredor durante a transição da coroa. */
export function pauseCorridorMusicForCrown() {
  corridorAudio?.pause();
}

/** Retoma a música do corredor após a transição da coroa, se ainda estiver ativa. */
export function resumeCorridorMusicAfterCrown() {
  if (!corredorAtivo) return;
  tentarTocar(getCorridorAudio(), "corredor");
}
