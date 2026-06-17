import { useState, lazy, Suspense } from "react";
import { MODES, getMode } from "@melos/data";
import { ModeList } from "./components/ModeList";
import { ModeDetail } from "./components/ModeDetail";
import type { LabSeed } from "./components/MotifWorkshop";
import type { GroovePattern } from "@melos/groove-lab";

// Mode Explorer (ModeList + ModeDetail) лишається eager — це стартовий вид.
// Решту важких вкладок вантажимо ліниво: так первинний бандл не тягне VexFlow,
// smplr і код усіх редакторів, поки користувач їх не відкрив. Кожна вкладка —
// окремий чанк, що підвантажується при першому переході на неї.
const EarTraining = lazy(() =>
  import("./components/EarTraining").then((m) => ({ default: m.EarTraining })),
);
const ComposerLab = lazy(() =>
  import("./components/ComposerLab").then((m) => ({ default: m.ComposerLab })),
);
const MotifWorkshop = lazy(() =>
  import("./components/MotifWorkshop").then((m) => ({ default: m.MotifWorkshop })),
);
const RhythmDesigner = lazy(() =>
  import("./components/RhythmDesigner").then((m) => ({ default: m.RhythmDesigner })),
);
const GrooveLab = lazy(() =>
  import("./components/GrooveLab").then((m) => ({ default: m.GrooveLab })),
);
const GrooveBass = lazy(() =>
  import("./components/GrooveBass").then((m) => ({ default: m.GrooveBass })),
);
const ReferenceLibrary = lazy(() =>
  import("./components/ReferenceLibrary").then((m) => ({ default: m.ReferenceLibrary })),
);

type View = "modes" | "lab" | "motif" | "rhythm" | "groove" | "groovebass" | "ear" | "library";

const VIEW_LABELS: Record<View, string> = {
  modes: "Mode Explorer",
  lab: "Composer's Lab",
  motif: "Motif Workshop",
  rhythm: "Rhythm Designer",
  groove: "Groove Lab",
  groovebass: "Groove-Bass Lab",
  ear: "Ear Training",
  library: "Reference Library",
};

/** Пункти головної навігації в порядку показу (підписи — як у топбарі). */
const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "modes", label: "Лади" },
  { id: "lab", label: "Composer's Lab" },
  { id: "motif", label: "Motif Workshop" },
  { id: "rhythm", label: "Rhythm Designer" },
  { id: "groove", label: "Groove Lab" },
  { id: "groovebass", label: "Groove-Bass" },
  { id: "ear", label: "Ear Training" },
  { id: "library", label: "Бібліотека" },
];

export function App() {
  const [view, setView] = useState<View>("modes");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(MODES[0]!.id);
  const [tonic, setTonic] = useState<string>("D");
  const [focusCitation, setFocusCitation] = useState<string | undefined>(undefined);
  const [labSeed, setLabSeed] = useState<LabSeed | null>(null);
  const [drumPattern, setDrumPattern] = useState<GroovePattern | null>(null);

  const mode = getMode(selectedId) ?? MODES[0]!;

  const openCitation = (id: string) => {
    setFocusCitation(id);
    setView("library");
  };

  const sendToLab = (seed: LabSeed) => {
    setLabSeed(seed);
    setView("lab");
  };

  /** Перехід на вид із головної навігації — закриває мобільне меню. */
  const go = (next: View) => {
    setView(next);
    setMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="app__topbar">
        <div className="app__brand">
          <img src={`${import.meta.env.BASE_URL}melos-logo.png`} alt="MELOS" className="app__brand-logo" />
          <span className="app__brand-sub text-secondary">{VIEW_LABELS[view]}</span>
        </div>
        <button
          className="app__menu-toggle"
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <nav className={"app__nav" + (menuOpen ? " app__nav--open" : "")}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={
                "app__nav-item" + (view === item.id ? " app__nav-item--active" : "")
              }
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {menuOpen ? (
          <div className="app__nav-backdrop" onClick={() => setMenuOpen(false)} />
        ) : null}
      </header>

      <Suspense
        fallback={<div className="app__loading text-secondary">Завантаження…</div>}
      >
        {view === "modes" ? (
        <div className="app__body">
          <aside className="app__sidebar">
            <ModeList
              selectedId={selectedId}
              onSelect={(m) => setSelectedId(m.id)}
            />
          </aside>
          <main className="app__main">
            <ModeDetail mode={mode} tonic={tonic} onTonicChange={setTonic} />
          </main>
        </div>
      ) : view === "ear" ? (
        <main className="app__main app__main--full">
          <EarTraining />
        </main>
      ) : view === "library" ? (
        <main className="app__main app__main--full">
          <ReferenceLibrary focusId={focusCitation} />
        </main>
      ) : view === "motif" ? (
        <main className="app__main app__main--full">
          <MotifWorkshop onCiteClick={openCitation} onSendToLab={sendToLab} />
        </main>
      ) : view === "rhythm" ? (
        <main className="app__main app__main--full">
          <RhythmDesigner onCiteClick={openCitation} />
        </main>
      ) : view === "groove" ? (
        <main className="app__main app__main--full">
          <GrooveLab onPatternChange={setDrumPattern} />
        </main>
      ) : view === "groovebass" ? (
        <main className="app__main app__main--full">
          <GrooveBass drumPattern={drumPattern} />
        </main>
      ) : (
        <main className="app__main app__main--full">
          <ComposerLab
            onCiteClick={openCitation}
            seed={labSeed}
            onSeedConsumed={() => setLabSeed(null)}
            drumPattern={drumPattern}
          />
        </main>
      )}
      </Suspense>
    </div>
  );
}
