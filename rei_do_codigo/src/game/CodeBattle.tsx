import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  enviarEntradaTerminal,
  encerrarTerminal,
  iniciarTerminal,
  obterDesafio,
  submeterCodigo,
  type Batalha,
  type DesafioCodigo,
  type Linguagem,
  type ResultadoAcao,
  type TerminalSessao,
} from "../api";
import { labelLinguagem } from "../Menu/language";

type Props = {
  batalha: Batalha;
  linguagem: Linguagem;
  onAtualizarBatalha: (parcial: Partial<Batalha>, resultado: ResultadoAcao) => void;
  disabled?: boolean;
};

type TermState = {
  /** Saída já “fechada” com quebras de linha. */
  log: string;
  /** Trecho sem \\n no fim (ex.: "Digite o numero: "). */
  tail: string;
  err: string;
};

function monacoLanguage(linguagem: Linguagem): string {
  if (linguagem === "JAVA") return "java";
  if (linguagem === "PYTHON") return "python";
  return "cpp";
}

function appendStdout(state: TermState, chunk: string): TermState {
  if (!chunk) return state;
  const combined = state.tail + chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const idx = combined.lastIndexOf("\n");
  if (idx === -1) {
    return { ...state, tail: combined };
  }
  return {
    ...state,
    log: state.log + combined.slice(0, idx + 1),
    tail: combined.slice(idx + 1),
  };
}

function appendStderr(state: TermState, chunk: string): TermState {
  if (!chunk) return state;
  const text = chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return { ...state, err: state.err + text };
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
  const [stdoutTestes, setStdoutTestes] = useState("");
  const [stderrTestes, setStderrTestes] = useState("");
  const [resultadoPendente, setResultadoPendente] = useState<ResultadoAcao | null>(null);

  const [term, setTerm] = useState<TermState>({ log: "", tail: "", err: "" });
  const [sysHint, setSysHint] = useState(
    "Escreva o código e clique em Executar para testar no terminal.",
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aguardandoEntrada, setAguardandoEntrada] = useState(false);
  const [inputAtual, setInputAtual] = useState("");
  const [busyTerminal, setBusyTerminal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const termEndRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(null);
      setFeedback(null);
      setStdoutTestes("");
      setStderrTestes("");
      setResultadoPendente(null);
      setTerm({ log: "", tail: "", err: "" });
      setSessionId(null);
      setAguardandoEntrada(false);
      setInputAtual("");
      setSysHint("Escreva o código e clique em Executar para testar no terminal.");
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
      const sid = sessionRef.current;
      if (sid) {
        void encerrarTerminal(batalha.id, sid).catch(() => undefined);
      }
    };
  }, [batalha.id]);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [term, aguardandoEntrada, inputAtual, sysHint]);

  useEffect(() => {
    if (aguardandoEntrada && !busyTerminal) {
      inputRef.current?.focus();
    }
  }, [aguardandoEntrada, busyTerminal, term.tail]);

  function aplicarSessao(res: TerminalSessao, echoLinha?: string) {
    setTerm((atual) => {
      let next = atual;
      if (echoLinha !== undefined) {
        next = {
          ...next,
          log: next.log + next.tail + echoLinha + "\n",
          tail: "",
        };
      }
      next = appendStdout(next, res.stdout ?? "");
      next = appendStderr(next, res.stderr ?? "");
      return next;
    });

    if (res.mensagem) {
      setSysHint(res.mensagem);
    }

    if (res.finalizado) {
      setSessionId(null);
      setAguardandoEntrada(false);
      return;
    }

    if (res.sessionId) {
      setSessionId(res.sessionId);
    }
    setAguardandoEntrada(Boolean(res.aguardandoEntrada));
  }

  async function iniciarExecucao() {
    if (
      !desafio ||
      enviando ||
      busyTerminal ||
      disabled ||
      resultadoPendente ||
      batalha.status !== "EM_ANDAMENTO" ||
      !codigo.trim()
    ) {
      return;
    }

    if (sessionId) {
      try {
        await encerrarTerminal(batalha.id, sessionId);
      } catch {
        // ignora
      }
    }

    setBusyTerminal(true);
    setErro(null);
    setFeedback(null);
    setTerm({ log: "", tail: "", err: "" });
    setSessionId(null);
    setAguardandoEntrada(false);
    setInputAtual("");
    setSysHint("Iniciando programa...");

    try {
      const res = await iniciarTerminal(batalha.id, codigo);
      aplicarSessao(res);
    } catch (e) {
      setSysHint(e instanceof Error ? e.message : "Falha ao iniciar o terminal.");
      setAguardandoEntrada(false);
      setSessionId(null);
    } finally {
      setBusyTerminal(false);
    }
  }

  async function enviarLinha() {
    if (!sessionId || !aguardandoEntrada || busyTerminal || disabled) return;
    const linha = inputAtual;
    setInputAtual("");
    setBusyTerminal(true);
    try {
      const res = await enviarEntradaTerminal(batalha.id, sessionId, linha);
      aplicarSessao(res, linha);
    } catch (e) {
      setSysHint(e instanceof Error ? e.message : "Falha ao enviar entrada.");
      setSessionId(null);
      setAguardandoEntrada(false);
    } finally {
      setBusyTerminal(false);
    }
  }

  async function cancelarTerminal() {
    if (!sessionId) return;
    setBusyTerminal(true);
    try {
      await encerrarTerminal(batalha.id, sessionId);
    } catch {
      // ignora
    } finally {
      setSessionId(null);
      setAguardandoEntrada(false);
      setBusyTerminal(false);
      setSysHint("Execução cancelada.");
    }
  }

  async function enviar() {
    if (
      enviando ||
      disabled ||
      resultadoPendente ||
      sessionId ||
      busyTerminal ||
      batalha.status !== "EM_ANDAMENTO" ||
      !codigo.trim()
    ) {
      return;
    }
    setEnviando(true);
    setErro(null);
    setFeedback(null);
    setStdoutTestes("");
    setStderrTestes("");
    try {
      const resultado = await submeterCodigo(batalha.id, codigo);
      setFeedback(resultado.mensagem);
      setStdoutTestes(resultado.stdout ?? "");
      setStderrTestes(resultado.stderr ?? "");

      if (resultado.acertou) {
        setResultadoPendente(resultado);
        setTerm({ log: "", tail: "", err: "" });
        setSysHint("");
        setAguardandoEntrada(false);
        setSessionId(null);
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

  const ocupado =
    enviando ||
    busyTerminal ||
    Boolean(sessionId) ||
    Boolean(resultadoPendente) ||
    disabled ||
    batalha.status !== "EM_ANDAMENTO";

  return (
    <div className="rk-side-panel rk-side-panel--code">
      <p className="rk-side-panel__title">Terminal · {labelLinguagem(linguagem)}</p>
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
                <strong>Exemplo entrada</strong>
                <pre>{desafio.entradaExemplo || "(vazia)"}</pre>
              </div>
              <div>
                <strong>Exemplo saída</strong>
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
                readOnly: Boolean(resultadoPendente) || disabled || Boolean(sessionId),
              }}
            />
          </div>

          {!resultadoPendente && (
            <div className="rk-panel rk-live-terminal" aria-label="Terminal interativo">
              <strong>Console</strong>
              <div className="rk-live-terminal__body">
                {sysHint && <div className="rk-term-sys">{sysHint}</div>}
                <pre className="rk-live-terminal__log">{term.log}</pre>
                {term.err && <pre className="rk-live-terminal__err">{term.err}</pre>}
                <div className="rk-term-input-row">
                  <span className="rk-term-tail">{term.tail}</span>
                  {aguardandoEntrada && (
                    <form
                      className="rk-term-input-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void enviarLinha();
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        className="rk-term-input"
                        value={inputAtual}
                        disabled={busyTerminal || disabled}
                        onChange={(e) => setInputAtual(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Entrada do terminal"
                      />
                    </form>
                  )}
                </div>
                <div ref={termEndRef} />
              </div>
            </div>
          )}

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
              <>
                <button
                  type="button"
                  className="rk-back-btn"
                  disabled={
                    busyTerminal ||
                    disabled ||
                    (!sessionId &&
                      (enviando ||
                        Boolean(resultadoPendente) ||
                        batalha.status !== "EM_ANDAMENTO"))
                  }
                  onClick={() => {
                    if (sessionId) {
                      void cancelarTerminal();
                      return;
                    }
                    void iniciarExecucao();
                  }}
                >
                  {sessionId
                    ? "Cancelar"
                    : busyTerminal
                      ? "Executando..."
                      : "Executar ›"}
                </button>
                <button
                  type="button"
                  className="rk-back-btn rk-confirm-btn"
                  disabled={ocupado}
                  onClick={() => void enviar()}
                >
                  {enviando ? "Validando..." : "Submeter ›"}
                </button>
              </>
            )}
          </div>

          {(stdoutTestes || stderrTestes) && (
            <div className="rk-panel rk-terminal-out">
              {stdoutTestes && (
                <>
                  <strong>Testes oficiais</strong>
                  <pre>{stdoutTestes}</pre>
                </>
              )}
              {stderrTestes && (
                <>
                  <strong>Stderr</strong>
                  <pre className="rk-stderr">{stderrTestes}</pre>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
