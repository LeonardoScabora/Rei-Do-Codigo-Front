type Props = {
  label: string;
  atual: number;
  maxima: number;
  variante?: "jogador" | "inimigo";
};

export default function VidasBar({
  label,
  atual,
  maxima,
  variante = "jogador",
}: Props) {
  return (
    <div className={`rk-vidas rk-vidas-${variante}`}>
      <span className="rk-vidas-label">{label}</span>
      <div className="rk-vidas-hearts" aria-label={`${label}: ${atual} de ${maxima}`}>
        {Array.from({ length: maxima }, (_, i) => (
          <span
            key={i}
            className={`rk-heart${i < atual ? " rk-heart-on" : " rk-heart-off"}`}
          >
            ♥
          </span>
        ))}
      </div>
    </div>
  );
}
