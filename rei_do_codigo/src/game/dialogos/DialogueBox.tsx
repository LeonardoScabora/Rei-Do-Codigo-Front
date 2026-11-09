import type { QuemFala } from "./dialogues";

type Props = {
  speaker: string;
  text: string;
  quem: QuemFala;
  ultima: boolean;
  onContinue: () => void;
};

export default function DialogueBox({ speaker, text, quem, ultima, onContinue }: Props) {
  return (
    <div className={`rk-dialogue rk-dialogue--${quem}`} role="dialog" aria-label={`Diálogo de ${speaker}`}>
      <div className="rk-dialogue__panel">
        <p className="rk-dialogue__speaker">{speaker}</p>
        <p className="rk-dialogue__text">{text}</p>
        <button type="button" className="rk-back-btn rk-confirm-btn" onClick={onContinue}>
          {ultima ? "Enfrentar ›" : "Continuar ›"}
        </button>
      </div>
    </div>
  );
}
