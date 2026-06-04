import { MODES, type ModeDefinition } from "@melos/data";
import { FAMILY_LABELS, FAMILY_ORDER } from "../labels";

interface Props {
  selectedId: string;
  onSelect: (mode: ModeDefinition) => void;
}

export function ModeList({ selectedId, onSelect }: Props) {
  // Групуємо лади за сімействами у заданому порядку.
  const grouped = FAMILY_ORDER.map((family) => ({
    family,
    modes: MODES.filter((m) => m.family === family),
  })).filter((g) => g.modes.length > 0);

  return (
    <nav className="mode-list" aria-label="Лади">
      {grouped.map(({ family, modes }) => (
        <section key={family} className="mode-list__group">
          <h2 className="mode-list__group-title">{FAMILY_LABELS[family]}</h2>
          <ul>
            {modes.map((mode) => (
              <li key={mode.id}>
                <button
                  className={
                    "mode-list__item" +
                    (mode.id === selectedId ? " mode-list__item--active" : "")
                  }
                  onClick={() => onSelect(mode)}
                >
                  {mode.names.uk}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
