import type { Linguagem } from "../api";

export type LanguageKey = "java" | "python" | "cpp";

export function toApiLinguagem(lang: LanguageKey): Linguagem {
  if (lang === "java") return "JAVA";
  if (lang === "python") return "PYTHON";
  return "CPP";
}

/** Nome de exibição da linguagem (ex.: "CPP" -> "C++"). */
export function labelLinguagem(lang: Linguagem | string): string {
  if (lang === "JAVA") return "Java";
  if (lang === "PYTHON") return "Python";
  if (lang === "CPP") return "C++";
  return lang;
}
