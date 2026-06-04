import type { PRNote, Meter } from "./components/PianoRoll";
import type { InstrumentName } from "./player";

/** Проєкт Composer's Lab для збереження в localStorage. */
export interface ProjectData {
  modeId: string;
  tonic: string;
  meter: Meter;
  bars: number;
  bpm: number;
  instrument: InstrumentName;
  notes: PRNote[];
}

const KEY = "melos:projects";

function readAll(): Record<string, ProjectData> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, ProjectData>;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, ProjectData>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* quota — ігноруємо */
  }
}

export function listProjects(): string[] {
  return Object.keys(readAll()).sort((a, b) => a.localeCompare(b));
}

export function saveProject(name: string, data: ProjectData): void {
  const all = readAll();
  all[name] = data;
  writeAll(all);
}

export function loadProject(name: string): ProjectData | null {
  return readAll()[name] ?? null;
}

export function deleteProject(name: string): void {
  const all = readAll();
  delete all[name];
  writeAll(all);
}
