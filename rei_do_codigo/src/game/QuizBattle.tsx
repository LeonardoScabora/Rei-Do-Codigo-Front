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
  /** Acertos necessários para vencer o inimigo (vida máxima dele). */
  totalPerguntas?: number;
  onAtualizarBatalha: (parcial: Partial<Batalha>, resultado: ResultadoAcao) => void;
  disabled?: boolean;
};

const ALTERNATIVAS: Alternativa[] = ["A", "B", "C", "D"];

function SkullIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden className="rk-skull-icon">
      <path
        d="M12 2 C6 2 3 6 3 10 C3 13 4.5 15 6 16 L6 19 L9 19 L9 21 L11 21 L11 19 L13 19 L13 21 L15 21 L15 19 L18 19 L18 16 C19.5 15 21 13 21 10 C21 6 18 2 12 2 Z"
        fill="currentColor"
      />
      <rect x="6.5" y="9" width="4" height="4" fill="#0a1410" />
      <rect x="13.5" y="9" width="4" height="4" fill="#0a1410" />
      <rect x="11" y="14" width="2" height="2.5" fill="#0a1410" />
    </svg>
  );
}

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
  totalPerguntas,
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
  const [correta, setCorreta] = useState<Alternativa | null>(null);
  const [aguardandoAvancar, setAguardandoAvancar] = useState(false);
  const [rodada, setRodada] = useState(0);

  const carregarPergunta = useCallback(async () => {
    if (batalha.status !== "EM_ANDAMENTO") return;
    setCarregando(true);
    setErro(null);
    setFeedback(null);
    setAcertouUltima(false);
    setEscolhida(null);
    setCorreta(null);
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
      setCorreta(resultado.alternativaCorreta ?? null);
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

  const numeroPergunta = Math.min(rodada + 1, totalPerguntas ?? rodada + 1);

  return (
    <div className="rk-side-panel">
      <div className="rk-quiz-emblem" aria-hidden>
        <SkullIcon />
      </div>

      <p className="rk-quiz-ribbon">Quiz · {batalha.nomeInimigo}</p>

      <p className="rk-quiz-counter">
        Pergunta {numeroPergunta}
        {totalPerguntas ? `/${totalPerguntas}` : ""}
      </p>

      {carregando && <p className="rk-hint">Carregando pergunta...</p>}
      {erro && <p className="rk-error">{erro}</p>}
      {feedback && (
        <p className={`rk-feedback${acertouUltima ? " rk-ok" : " rk-bad"}`}>{feedback}</p>
      )}

      {pergunta && !carregando && (
        <div className="rk-quiz-panel">
          <div className="rk-quiz-question">
            <p className="rk-quiz-enunciado">{pergunta.enunciado}</p>
          </div>
          <div className="rk-quiz-options">
            {ALTERNATIVAS.map((alt) => {
              const respondida = escolhida !== null;
              const marcada = escolhida === alt;
              const revelarCorreta = respondida && !acertouUltima && correta === alt;
              let classeExtra = "";
              if (marcada) {
                classeExtra = acertouUltima ? " rk-quiz-option--ok" : " rk-quiz-option--bad";
              } else if (revelarCorreta) {
                classeExtra = " rk-quiz-option--correct";
              }
              return (
                <button
                  key={alt}
                  type="button"
                  className={`rk-quiz-option${classeExtra}`}
                  disabled={!podeResponder}
                  onClick={() => void responder(alt)}
                >
                  <span className="rk-quiz-letter">{alt}</span>
                  <span className="rk-quiz-texto">{textoAlternativa(pergunta, alt)}</span>
                  {revelarCorreta && (
                    <span className="rk-quiz-correct-tag">✓ correta</span>
                  )}
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
