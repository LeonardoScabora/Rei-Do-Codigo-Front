type Props = {
  speaker: string;
  text: string;
  onContinue: () => void;
};

export default function DialogueBox({ speaker, text, onContinue }: Props) {
  return (
    <div className="rk-dialogue" role="dialog" aria-label={`Diálogo de ${speaker}`}>
      <div className="rk-dialogue__panel">
        <p className="rk-dialogue__speaker">{speaker}</p>
        <p className="rk-dialogue__text">{text}</p>
        <button type="button" className="rk-back-btn rk-confirm-btn" onClick={onContinue}>
          Continuar ›
        </button>
      </div>
    </div>
  );
}
