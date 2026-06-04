# @melos/groove-bass — Groove-Bass Lab

Headless движок модуля **Groove-Bass Lab** (R2): басові архетипи з ритмічної архітектури груву.
Спека/таксономія: `../../docs/GROOVE-BASS-LAB.md` + `GROOVE-BASS-TAXONOMY.md`.

## Скрипти

```
npm install
npm test          # vitest run
npm run typecheck # tsc --noEmit (strict, noUncheckedIndexedAccess)
```

## Структура (папки = майбутні MELOS-шари, промоушн при зв'язуванні workspace)

```
src/transport/   SongContext + крок↔тік   → core-theory
src/harmony/     парсер акордів (Tonal.js) → core-theory/harmony
src/analysis/    groove-dna · recommend · realize → core-analysis
src/data/        archetypes (Tumbao) · schema (Zod) · ggl-styles → data
src/pedagogy/    explanation registry + bibliography → core-pedagogy
src/view/        ASCII piano-roll (тимчасово; R3 → VexFlow/piano-roll)
```

## R2 проти R0
- Типи + строгий TS (`noUncheckedIndexedAccess`).
- Парсер акордів → **Tonal.js**.
- Каталог валідовано **Zod**; інваріант «≥1 цитата» — у схемі й тесті.
- Педагогіка винесена в `pedagogy/` (Finding → Explanation + bibliography).
- Виправлено wart R1: архетип «поза родиною» дає окремий `Finding`.

## Далі
- R3: `view/` → справжній piano-roll/нотація, вкладка в `apps/web`, синхр. з вибором стилю GGL.
- R4: підключити решту родин каталогу (Funk, Dub, Afrobeat, Aksak…).
- Інфра: зв'язати pnpm-workspace і промоутнути папки у спільні пакети.
