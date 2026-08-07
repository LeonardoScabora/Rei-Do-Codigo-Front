import type { Linguagem } from "../api";

export type LanguageKey = "java" | "python" | "cpp";

export function toApiLinguagem(lang: LanguageKey): Linguagem {
  if (lang === "java") return "JAVA";
  if (lang === "python") return "PYTHON";
  return "CPP";
}
