type Props = {
  label: string;
  atual: number;
  maxima: number;
  variante?: "jogador" | "inimigo";
};

/** Barra de vida estilo RPG: coração + trilha preenchida + contador "3/3". */
export default function VidasBar({
  label,
  atual,
  maxima,
  variante = "jogador",
}: Props) {
  const pct = maxima > 0 ? Math.max(0, Math.min(1, atual / maxima)) * 100 : 0;
  return (
    <div
      className={`rk-hpbar rk-hpbar--${variante}`}
      role="img"
      aria-label={`${label}: ${atual} de ${maxima} de vida`}
    >
      <span className="rk-hpbar__heart" aria-hidden>
        ♥
      </span>
      <span className="rk-hpbar__track" aria-hidden>
        <span className="rk-hpbar__fill" style={{ width: `${pct}%` }} />
        <span className="rk-hpbar__text">
          {atual}/{maxima}
        </span>
      </span>
    </div>
  );
}
