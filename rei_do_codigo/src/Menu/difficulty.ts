import type { NivelDificuldade } from "../api";

export type DifficultyKey = "iniciante" | "intermediario" | "avancado";

export const DIFFICULTIES: {
  key: DifficultyKey;
  label: string;
  hint: string;
}[] = [
  { key: "iniciante", label: "Iniciante", hint: "Fundamentos e sintaxe básica" },
  { key: "intermediario", label: "Intermediário", hint: "Estruturas e lógica moderada" },
  { key: "avancado", label: "Avançado", hint: "Desafios mais densos da linguagem" },
];

export function toApiNivel(key: DifficultyKey): NivelDificuldade {
  if (key === "iniciante") return "INICIANTE";
  if (key === "intermediario") return "INTERMEDIARIO";
  return "AVANCADO";
}

export function labelNivel(nivel?: string | null): string {
  if (nivel === "INICIANTE") return "Iniciante";
  if (nivel === "INTERMEDIARIO") return "Intermediário";
  if (nivel === "AVANCADO") return "Avançado";
  return nivel ?? "";
}
