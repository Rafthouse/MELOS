import { TONICS } from "../labels";

interface Props {
  value: string;
  onChange: (tonic: string) => void;
}

export function TonicSelector({ value, onChange }: Props) {
  return (
    <div className="tonic-selector" role="group" aria-label="Тоніка">
      {TONICS.map((t) => (
        <button
          key={t}
          className={
            "tonic-selector__btn" +
            (t === value ? " tonic-selector__btn--active" : "")
          }
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
