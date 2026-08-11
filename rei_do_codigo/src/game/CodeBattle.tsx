import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  obterDesafio,
  submeterCodigo,
  type Batalha,
  type DesafioCodigo,
  type Linguagem,
  type ResultadoAcao,
} from "../api";

type Props = {
  batalha: Batalha;
  linguagem: Linguagem;
  onAtualizarBatalha: (parcial: Partial<Batalha>, resultado: ResultadoAcao) => void;
  disabled?: boolean;
};

function monacoLanguage(linguagem: Linguagem): string {
  if (linguagem === "JAVA") return "java";
  if (linguagem === "PYTHON") return "python";
  return "cpp";
}

export default function CodeBattle({
  batalha,
  linguagem,
  onAtualizarBatalha,
  disabled = false,
}: Props) {
  const [desafio, setDesafio] = useState<DesafioCodigo | null>(null);
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [resultadoPendente, setResultadoPendente] = useState<ResultadoAcao | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(null);
      setFeedback(null);
      setStdout("");
      setStderr("");
      setResultadoPendente(null);
      try {
        const d = await obterDesafio(batalha.id);
        if (!ativo) return;
        setDesafio(d);
        setCodigo(d.codigoInicial ?? "");
      } catch (e) {
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar desafio.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [batalha.id]);

  async function enviar() {
    if (
      enviando ||
      disabled ||
      resultadoPendente ||
      batalha.status !== "EM_ANDAMENTO" ||
      !codigo.trim()
    ) {
      return;
    }
    setEnviando(true);
    setErro(null);
    setFeedback(null);
    setStdout("");
    setStderr("");
    try {
      const resultado = await submeterCodigo(batalha.id, codigo);
      setFeedback(resultado.mensagem);
      setStdout(resultado.stdout ?? "");
      setStderr(resultado.stderr ?? "");

      if (resultado.acertou) {
        // Mantém o painel aberto para o jogador ver o que passou nos testes.
        setResultadoPendente(resultado);
      } else {
        onAtualizarBatalha(
          {
            vidaJogador: resultado.vidaJogador,
            vidaInimigo: resultado.vidaInimigo,
            status: resultado.status,
          },
          resultado,
        );
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao submeter código.");
    } finally {
      setEnviando(false);
    }
  }

  function avancarAposAcerto() {
    if (!resultadoPendente) return;
    const resultado = resultadoPendente;
    setResultadoPendente(null);
    onAtualizarBatalha(
      {
        vidaJogador: resultado.vidaJogador,
        vidaInimigo: resultado.vidaInimigo,
        status: resultado.status,
      },
      resultado,
    );
  }

  return (
    <div className="rk-side-panel rk-side-panel--code">
      <p className="rk-side-panel__title">Terminal · {linguagem}</p>
      {carregando && <p className="rk-hint">Carregando desafio...</p>}
      {erro && <p className="rk-error">{erro}</p>}
      {feedback && (
        <p className={`rk-feedback${resultadoPendente ? " rk-ok" : ""}`}>{feedback}</p>
      )}

      {desafio && (
        <>
          <div className="rk-panel rk-desafio-info">
            <p className="rk-quiz-enunciado">{desafio.enunciado}</p>
            <div className="rk-io-examples">
              <div>
                <strong>Entrada</strong>
                <pre>{desafio.entradaExemplo || "(vazia)"}</pre>
              </div>
              <div>
                <strong>Saída</strong>
                <pre>{desafio.saidaExemplo || "(vazia)"}</pre>
              </div>
            </div>
          </div>

          <div className="rk-editor-wrap">
            <Editor
              height="100%"
              width="100%"
              theme="vs-dark"
              language={monacoLanguage(linguagem)}
              value={codigo}
              onChange={(value) => setCodigo(value ?? "")}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                fixedOverflowWidgets: true,
                readOnly: Boolean(resultadoPendente) || disabled,
              }}
            />
          </div>

          <div className="rk-actions rk-code-actions">
            {resultadoPendente ? (
              <button
                type="button"
                className="rk-back-btn rk-confirm-btn"
                onClick={avancarAposAcerto}
              >
                Avançar ›
              </button>
            ) : (
              <button
                type="button"
                className="rk-back-btn rk-confirm-btn"
                disabled={enviando || disabled || batalha.status !== "EM_ANDAMENTO"}
                onClick={() => void enviar()}
              >
                {enviando ? "Executando..." : "Submeter ›"}
              </button>
            )}
          </div>

          {(stdout || stderr) && (
            <div className="rk-panel rk-terminal-out">
              {stdout && (
                <>
                  <strong>Testes</strong>
                  <pre>{stdout}</pre>
                </>
              )}
              {stderr && (
                <>
                  <strong>Stderr</strong>
                  <pre className="rk-stderr">{stderr}</pre>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
