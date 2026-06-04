import { useEffect, useRef, useState } from "react";
import { allCitations, formatCitation, toBibTeX, type SourceType } from "@melos/data";

interface Props {
  /** ID джерела, на яке треба сфокусуватись (клік із критики). */
  focusId?: string;
}

const TYPE_LABEL: Record<SourceType, string> = {
  book: "книга",
  article: "стаття",
  chapter: "розділ",
  thesis: "дисертація",
};

export function ReferenceLibrary({ focusId }: Props) {
  const entries = allCitations();
  const [copied, setCopied] = useState<string | null>(null);
  const focusedRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (focusId && focusedRef.current) {
      focusedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId]);

  const copyBibTeX = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(toBibTeX(entry));
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard заблоковано — ігноруємо */
    }
  };

  return (
    <div className="reflib">
      <header className="reflib__header">
        <h1 className="reflib__title">Reference Library</h1>
        <p className="text-secondary reflib__subtitle">
          Кожна порада MELOS спирається на джерело. Тут — повний перелік (ТЗ M10).
        </p>
      </header>

      <ul className="reflib__list">
        {entries.map((e) => {
          const isFocus = e.id === focusId;
          return (
            <li
              key={e.id}
              ref={isFocus ? focusedRef : null}
              className={"refentry" + (isFocus ? " refentry--focus" : "")}
            >
              <div className="refentry__head">
                <span className="refentry__type">{TYPE_LABEL[e.type]}</span>
                {e.ukrainianSource && <span className="refentry__ua">UA</span>}
                <code className="refentry__id">{e.id}</code>
              </div>
              <div className="refentry__cite">{formatCitation(e)}</div>
              {e.titleUk && e.titleUk !== e.title && (
                <div className="refentry__title-uk text-secondary">{e.titleUk}</div>
              )}
              <div className="refentry__note text-secondary">{e.note.uk}</div>
              <div className="refentry__actions">
                <button className="btn btn--small" onClick={() => copyBibTeX(e.id)}>
                  {copied === e.id ? "✓ скопійовано" : "BibTeX"}
                </button>
                {e.url && (
                  <a className="btn btn--small" href={e.url} target="_blank" rel="noreferrer">
                    джерело ↗
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
