import { apiFetch } from "./client";
import type {
  Alternativa,
  Batalha,
  DesafioCodigo,
  Inimigo,
  Linguagem,
  NivelDificuldade,
  Pergunta,
  ResultadoAcao,
  Usuario,
} from "./types";

export * from "./types";
export { ApiError } from "./client";

export function criarUsuario(nome: string, linguagem: Linguagem, nivel: NivelDificuldade) {
  return apiFetch<Usuario>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, linguagem, nivel }),
  });
}

export function listarUsuarios() {
  return apiFetch<Usuario[]>("/api/usuarios");
}

export function buscarUsuario(id: number) {
  return apiFetch<Usuario>(`/api/usuarios/${id}`);
}

export function excluirUsuario(id: number) {
  return apiFetch<void>(`/api/usuarios/${id}`, {
    method: "DELETE",
  });
}

export function listarInimigos() {
  return apiFetch<Inimigo[]>("/api/inimigos");
}

export function iniciarBatalha(usuarioId: number, inimigoId: number) {
  const params = new URLSearchParams({
    usuarioId: String(usuarioId),
    inimigoId: String(inimigoId),
  });
  return apiFetch<Batalha>(`/api/batalhas/iniciar?${params}`, {
    method: "POST",
  });
}

export function buscarBatalha(id: number) {
  return apiFetch<Batalha>(`/api/batalhas/${id}`);
}

export function proximaPergunta(batalhaId: number) {
  return apiFetch<Pergunta>(`/api/batalhas/${batalhaId}/proxima-pergunta`);
}

export function responderPergunta(
  batalhaId: number,
  perguntaId: number,
  alternativa: Alternativa,
) {
  return apiFetch<ResultadoAcao>(`/api/batalhas/${batalhaId}/responder`, {
    method: "POST",
    body: JSON.stringify({ perguntaId, alternativa }),
  });
}

export function obterDesafio(batalhaId: number) {
  return apiFetch<DesafioCodigo>(`/api/batalhas/${batalhaId}/desafio`);
}

export function submeterCodigo(batalhaId: number, codigo: string) {
  return apiFetch<ResultadoAcao>(`/api/batalhas/${batalhaId}/submeter-codigo`, {
    method: "POST",
    body: JSON.stringify({ codigo }),
  });
}
