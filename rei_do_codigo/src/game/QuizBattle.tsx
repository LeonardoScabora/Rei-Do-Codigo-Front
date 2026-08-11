import { useCallback, useEffect, useState } from "react";
import {
  proximaPergunta,
  responderPergunta,
  type Alternativa,
  type Batalha,
  type Pergunta,
  type ResultadoAcao,
} from "../api";

type Props = {
  batalha: Batalha;
  onAtualizarBatalha: (parcial: Partial<Batalha>, resultado: ResultadoAcao) => void;
  disabled?: boolean;
};

const ALTERNATIVAS: Alternativa[] = ["A", "B", "C", "D"];

function textoAlternativa(pergunta: Pergunta, alt: Alternativa): string {
  switch (alt) {
    case "A":
      return pergunta.alternativaA;
    case "B":
      return pergunta.alternativaB;
    case "C":
      return pergunta.alternativaC;
    case "D":
      return pergunta.alternativaD;
  }
}

export default function QuizBattle({
  batalha,
  onAtualizarBatalha,
  disabled = false,
}: Props) {
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [acertouUltima, setAcertouUltima] = useState(false);
  const [escolhida, setEscolhida] = useState<Alternativa | null>(null);
  const [aguardandoAvancar, setAguardandoAvancar] = useState(false);
  const [rodada, setRodada] = useState(0);

  const carregarPergunta = useCallback(async () => {
    if (batalha.status !== "EM_ANDAMENTO") return;
    setCarregando(true);
    setErro(null);
    setFeedback(null);
    setAcertouUltima(false);
    setEscolhida(null);
    setAguardandoAvancar(false);
    try {
      const p = await proximaPergunta(batalha.id);
      setPergunta(p);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar pergunta.");
    } finally {
      setCarregando(false);
    }
  }, [batalha.id, batalha.status]);

  useEffect(() => {
    void carregarPergunta();
  }, [carregarPergunta, rodada]);

  async function responder(alternativa: Alternativa) {
    if (
      !pergunta ||
      enviando ||
      disabled ||
      aguardandoAvancar ||
      batalha.status !== "EM_ANDAMENTO"
    ) {
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const resultado = await responderPergunta(batalha.id, pergunta.id, alternativa);
      setFeedback(resultado.mensagem);
      setAcertouUltima(resultado.acertou);
      setEscolhida(alternativa);
      onAtualizarBatalha(
        {
          vidaJogador: resultado.vidaJogador,
          vidaInimigo: resultado.vidaInimigo,
          status: resultado.status,
        },
        resultado,
      );
      if (resultado.status === "EM_ANDAMENTO") {
        setAguardandoAvancar(true);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao responder.");
    } finally {
      setEnviando(false);
    }
  }

  function avancar() {
    if (!aguardandoAvancar) return;
    setAguardandoAvancar(false);
    setRodada((r) => r + 1);
  }

  const podeResponder =
    batalha.status === "EM_ANDAMENTO" && !carregando && !enviando && !disabled && !aguardandoAvancar;

  return (
    <div className="rk-side-panel">
      <p className="rk-side-panel__title">Quiz · {batalha.nomeInimigo}</p>
      {carregando && <p className="rk-hint">Carregando pergunta...</p>}
      {erro && <p className="rk-error">{erro}</p>}
      {feedback && (
        <p className={`rk-feedback${acertouUltima ? " rk-ok" : " rk-bad"}`}>{feedback}</p>
      )}

      {pergunta && !carregando && (
        <div className="rk-panel rk-quiz-panel">
          <p className="rk-quiz-enunciado">{pergunta.enunciado}</p>
          <div className="rk-quiz-options">
            {ALTERNATIVAS.map((alt) => {
              const marcada = escolhida === alt;
              const classeExtra = marcada
                ? acertouUltima
                  ? " rk-quiz-option--ok"
                  : " rk-quiz-option--bad"
                : "";
              return (
                <button
                  key={alt}
                  type="button"
                  className={`rk-item rk-quiz-option${classeExtra}`}
                  disabled={!podeResponder}
                  onClick={() => void responder(alt)}
                >
                  <span className="rk-quiz-letter">{alt}</span>
                  <span>{textoAlternativa(pergunta, alt)}</span>
                </button>
              );
            })}
          </div>

          {aguardandoAvancar && (
            <div className="rk-actions rk-quiz-advance">
              <button type="button" className="rk-back-btn rk-confirm-btn" onClick={avancar}>
                {acertouUltima ? "Avançar ›" : "Próxima pergunta ›"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
