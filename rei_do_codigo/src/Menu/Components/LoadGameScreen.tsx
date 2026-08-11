import { useEffect, useState } from "react";
import { excluirUsuario, listarUsuarios, type Usuario } from "../../api";
import { labelNivel } from "../difficulty";
import { labelLinguagem } from "../language";

type Props = {
  onBack: () => void;
  onLoad: (usuario: Usuario) => void;
};

function textoProgresso(usuario: Usuario) {
  if (usuario.venceuRei) return "Venceu o Rei do Código";
  return `Corredor · sala ${usuario.progresso}`;
}

export default function LoadGameScreen({ onBack, onLoad }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await listarUsuarios();
        if (ativo) setUsuarios(lista);
      } catch (e) {
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar saves.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => {
      ativo = false;
      window.removeEventListener("keydown", handler);
    };
  }, [onBack]);

  const selecionado = usuarios.find((u) => u.id === selecionadoId) ?? null;

  async function handleExcluir() {
    if (!selecionado || excluindo) return;
    setExcluindo(true);
    setErro(null);
    try {
      await excluirUsuario(selecionado.id);
      setUsuarios((lista) => lista.filter((u) => u.id !== selecionado.id));
      setSelecionadoId(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao excluir save.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <>
      <div className="rk-panel">
        <div className="rk-subtitle">
          <span className="rk-diamond-sm" /> Carregar Jogo <span className="rk-diamond-sm" />
        </div>

        {carregando && <p className="rk-save-empty">Buscando progressos...</p>}
        {erro && <p className="rk-error">{erro}</p>}

        {!carregando && !erro && usuarios.length === 0 && (
          <p className="rk-save-empty">Nenhum progresso salvo no banco.</p>
        )}

        {!carregando && usuarios.length > 0 && (
          <div className="rk-save-list">
            {usuarios.map((usuario) => {
              const ativo = selecionadoId === usuario.id;
              return (
                <div key={usuario.id} className="rk-save-block">
                  <button
                    type="button"
                    className={`rk-save-item rk-save-item-btn${ativo ? " rk-selected" : ""}`}
                    onClick={() =>
                      setSelecionadoId((id) => (id === usuario.id ? null : usuario.id))
                    }
                  >
                    <div className="rk-save-info">
                      <span className="rk-save-lang">
                        {usuario.nome} · {labelLinguagem(usuario.linguagem)} ·{" "}
                        {labelNivel(usuario.nivel)}
                      </span>
                      <span className="rk-save-meta">{textoProgresso(usuario)}</span>
                    </div>
                    {ativo && <span className="rk-arrow rk-save-arrow">▶</span>}
                  </button>

                  {ativo && (
                    <div className="rk-save-actions">
                      <button
                        type="button"
                        className="rk-back-btn rk-save-delete-btn"
                        disabled={excluindo}
                        onClick={() => void handleExcluir()}
                      >
                        {excluindo ? "Excluindo..." : "Excluir"}
                      </button>
                      <button
                        type="button"
                        className="rk-back-btn rk-confirm-btn"
                        disabled={excluindo}
                        onClick={() => onLoad(usuario)}
                      >
                        Continuar ›
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rk-actions">
        <button type="button" className="rk-back-btn" onClick={onBack}>
          ‹ Voltar
        </button>
      </div>
    </>
  );
}
