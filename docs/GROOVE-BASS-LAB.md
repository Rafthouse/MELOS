# Groove-Bass Lab — Специфікація і таксономія

> Статус: проєктна специфікація (без коду). Модуль MELOS. Сестра `groove-lab` і `harmony`.
> Базується на: `docs/ARCHITECTURE.md` (MELOS) + реальний контракт даних Groove Grammar Lab (`rhythm-packs.js`, `STYLE_LIBRARY`).
> Принцип: де є вибір — він зроблений тут із обґрунтуванням і джерелом.

---

## 0. Головна теза

**Бас тут не генерується від мелодії й не «вигадується». Він виводиться з ритмічної архітектури груву та історично сформованих традицій ритм-секції.**

Модуль — це не «басовий генератор», а **навчальний міст**: він бере грув із Groove Grammar Lab (GGL), визначає, які історичні басові архетипи природно підтримують цей грув, показує їх у вигляді піано-рола/нот на окремій вкладці і **пояснює чому** — у тому самому навчальному форматі, що й GGL.

Один рядок, який тримає весь дизайн:

> **Архетип баса = ритмічний шаблон (з груву) ⊥ стратегія висоти (з гармонії).**
> Вісь ритму дивиться на `groove-lab`. Вісь висоти дивиться на `harmony`. Тому це міст, а не додаток.

---

## 1. Місце в MELOS

### 1.1 Шари (правило ARCHITECTURE §3: стрілки лише вниз)

```
apps/web  ──  вкладка "Groove-Bass" (piano-roll / notation)        ← UI
ui · audio · notation                                              ← платформа
core-pedagogy   (Finding → Explanation + citations)                ← педагогіка
core-analysis   (Groove DNA · Bass DNA · mapping/scoring)          ← алгоритми
core-theory/rhythm (syncopation index, метрична сітка)             ← фундамент
data            (BassArchetype[] — каталог, Zod-валідований)       ← істина
```

Нічого нового в архітектурі не з'являється. Модуль — це:
- **дані**: `data/bass-archetypes` (каталог архетипів, як `modes`/`rhythmic-cells`);
- **алгоритми**: `core-analysis/groove-bass` (DNA + mapping engine → `Finding[]`);
- **педагогіка**: записи в `ExplanationRegistry` + бібліографія;
- **UI**: вкладка `groove-bass` в `apps/web`, що споживає вибраний стиль GGL.

### 1.2 Пакет

`@melos/groove-bass` (display name **Groove-Bass Lab**). Пара до `@melos/groove-lab`.
Ширша рамка (на майбутнє): модуль — перший крок до `rhythm-section` (drums ⟷ bass ⟷ harmony). Бас — перший громадянин; той самий каркас потім приймає інші ролі (comping, pad-ритм).

### 1.3 Як це лягає на наявні інваріанти MELOS

| Інваріант MELOS (ARCHITECTURE) | Реалізація в Groove-Bass Lab |
|---|---|
| D5 «педагогіка — це дані, не код» | `BassArchetype` = JSON+Zod, як `ModeDefinition`. GGL уже возить `principles[[title,text]]` — той самий патерн. |
| «вихід алгоритму — `Finding`, не число» | Рекомендація = `Finding[]` (kind, severity, params, citationIds) → `Explanation`. Блок «✓ Tumbao / ⚠ Walking» — це рендер Findings. |
| «жодної поради без `citations[]`» | Кожен архетип має `sources[]` (min 1). Інваріант перевіряється тестом. Це і є гарантія «не галюцинація». |
| «core headless, повністю тестований» | Движок (DNA + mapping) — чистий TS, тестується без UI/аудіо на реальних `seed` GGL. |

---

## 2. Інтеграція з Groove Grammar Lab

### 2.1 Контракт даних (вхід) — уже існує

GGL-стиль (`STYLE_LIBRARY[id]`) має стабільну форму. Це і є вхід модуля:

```js
{
  name, family,            // напр. "Afro-Cuban", "American funk", "Reggae and dub"
  meter,                   // "4-4" | "6-8" | "7-8" | "2-4" | "12-8" ...
  tempo: [min, max], swing,
  tags: [...],
  seed: {                  // 0-based індекси кроків на сітці stepsPerBar
    kick, snare, closedHat, openHat, rim, tom, perc, shaker
  },
  principles: [[title, text], ...]
}
```

`stepsPerBar` за метром (з GGL): **2/4→8 · 3/4→12 · 4/4→16 · 5/4→20 · 5/8→10 · 6/8→12 · 7/8→14 · 9/8→18 · 10/8→20 · 11/8→22 · 12/8→24 · 13/8→26**.

> **Наслідок:** басовий трек — це просто ще один трек у тій самій сітці: `bass: [stepIndices]` + висоти. Піано-рол = горизонтальна сітка кроків GGL + вертикальні лінії висоти. Нічого конвертувати не треба.

### 2.2 Зчеплення «вибір стилю → басовий малюнок» (ключова вимога)

Коли користувач обирає стиль у GGL, модуль виконує конвеєр:

```
GGL style (family, meter, tags, seed, tempo)
        │
   (1) КАТАЛОГ      (family × meter) ──► кандидати-архетипи      [детерміновано, куровано]
        │
   (2) GROOVE DNA   seed ──► {kickAlignment, syncopation, ghostDensity, accentStructure, weight}
        │
   (3) SCORING      DNA × кожен кандидат ──► fit 0..1 + Finding[]  (✓ / ⚠ + чому)
        │
   (4) РЕАЛІЗАЦІЯ   обраний архетип ──► bass-трек на stepsPerBar-сітці + pitchStrategy(harmCtx)
        │
   (5) ВИВІД        piano-roll / notation + навчальний шар (principles, why, citations)
```

- **(1) Каталог** гарантує історичну обґрунтованість («вибір стилю прямо керує басом» — детерміновано).
- **(2)+(3) Движок** оцінює *конкретний* seed (а не лише назву стилю) → працює і для гібридів, і коли користувач руками змінив грув у GGL.
- Зміна стилю в GGL → подія → перерахунок (1)–(5). Це і є «безпосередній вплив вибору стилю на бас».

### 2.3 Подієвий контракт (UI-bridge)

GGL і вкладка баса спілкуються одним повідомленням (shared store / event bus; для PoC — `window` event або спільний AudioContext-міст, як зазначено в `@melos/groove-lab`):

```ts
type GrooveSelected = {
  styleId: string; family: string; meter: string;
  stepsPerBar: number; tempo: number; swing: number;
  seed: Record<TrackName, number[]>;
  // опційно з harmony-модуля (коли з'явиться):
  harmonicContext?: { key: string; progression?: ChordEvent[] };
};
```

### 2.4 Навчальний паритет із GGL (вимога «всі навчальні елементи, як у GGL»)

GGL уже має: explanation mode, style principles, affinity map, pattern comparison, info box. Бас-вкладка **дзеркалить кожен**:

| GGL | Groove-Bass Lab |
|---|---|
| Style principles | `archetype.principles[]` (title+text, uk/en) |
| Explanation mode (чому подія існує) | per-note `why`: lockKick / anticipate / fill-gap / approach-next-root |
| Style info box | Archetype info box: походження, епоха, регіон, метр, family, exemplar-треки |
| Rhythm affinity map | Bass-archetype affinity (споріднені баси за спільною ритм-граматикою/family/tags) |
| Pattern comparison | Порівняння двох архетипів над тим самим грувом |
| — (GGL не має) | **Citations** (`sources[]`) — інваріант MELOS, додається понад GGL |

### 2.5 Спільний транспорт (`SongContext`) — крос-модульна основа MELOS

> Це більше за бас-модуль: вимога користувача — **усі блоки MELOS працюють у спільному темпотаймі**, доповнюють один одного, мелодія прив'язана до тієї самої сітки, темп і **розмір (метр) — спільні**. Тут це фіксується як фундамент, на який бас спирається; за духом — належить і до `ARCHITECTURE.md` (крос-модульний шар).

**Єдине джерело істини про час і гармонію**, яке читають/пишуть усі модулі (Groove Lab, Bass, Composer's Lab/Melody, Harmony):

```ts
SongContext {
  tempo: number;                          // BPM — СПІЛЬНИЙ для всіх блоків
  meter: { num: number; den: number };    // розмір (напр. {7,8}) — СПІЛЬНИЙ; визначає stepsPerBar
  ppq: number;                            // ticks per quarter — канонічна роздільність часу (напр. 480)
  key: { tonic: string; mode: string };   // спільний гармонічний дім
  chords: ChordEvent[];                   // АКОРДОВИЙ ТРЕК на спільній сітці
  lengthBars: number;
  // рантайм (app-шар): position, isPlaying, loop — спільний транспорт відтворення
}

ChordEvent {                              // акорд «на потрібну долю»
  tick: number; durTicks: number;         // позиція на канонічній tick-таймлінії (снеп до сітки)
  symbol: string;                         // "Am7", "D/F#" — парситься Tonal.js → {root, quality, bass}
}
```

**Канонічний час = тіки (PPQ), не секунди** — це вже рішення MELOS (ARCHITECTURE §4.2). Звідси узгодження сіток:

- GGL-сітка `stepsPerBar` — це **вид** на tick-таймлінію. `tickPerStep = barTicks / stepsPerBar`, де `barTicks = num · ppq · 4/den`.
- Підрахунок дає **рівно sixteenth-сітку для всіх метрів GGL**: 4/4→ppq/4, 6/8→ppq/4, 7/8→ppq/4, 2/4→ppq/4. Тобто GGL-кроки і ноти мелодії живуть на одній tick-осі; конвертація крок↔тік однакова скрізь.
- **Темп** глобальний (GGL-`tempo:[min,max]` стає лише підказкою в UI; авторитетне — `SongContext.tempo`).
- **Розмір** глобальний: зміна метра реконфігурує і GGL-`stepsPerBar`, і бас-сітку, і нотацію — одночасно.

**Хто що робить із контекстом:**

| Модуль | Читає | Пише |
|---|---|---|
| Groove Lab (GGL) | meter, tempo | drum `seed` (грув) |
| **Groove-Bass Lab** | грув (GGL) + meter + tempo + **chords** | bass-трек на спільній сітці |
| Composer's Lab / Melody | meter, tempo, key, chords, сітка | melody на тих самих тіках |
| Harmony | key, meter | **chord-трек** (прогресія) |
| audio (Tone.js Transport) | tempo, meter | — (єдиний годинник відтворення) |

**Розташування** (за шарами ARCHITECTURE): *модель* `SongContext`/`ChordEvent` — у `core-theory`; *жива стан-стора* (поточні tempo/meter/key/chords/position) — спільний store в `apps/web`, на який підписані всі вкладки; *годинник* — у `audio`. Жоден `core-*` не знає про React.

Саме бас-модуль **першим робить акордовий трек чутним як висотний матеріал, замкнений на грув** — тобто це перша наскрізна перевірка всієї ідеї спільного транспорту.

---

## 3. Концептуальна модель: дві осі

Найважливіша ідея специфікації. Архетип баса розкладається на дві **ортогональні** осі:

### Вісь A — Ритм (дивиться на groove-lab)
*Де* падають ноти. Виводиться з груву:
- `anchorMode`: `absolute` (фіксовані кроки) · `relativeToKick` (зміщення відносно кіка) · `relativeToClave` (відносно clave/rim).
- `onsets[]`, `accents[]`, `ghosts[]`, `ties[]` (витримані ноти — напр. довгі корені в дабі).
- `grooveLock`: як бас стосується барабанів — `lockKick` (в унісон із кіком, pocket) · `interlock` (заповнює проміжки кіка) · `anticipate` (передбачає долю — понче тумбао) · `pedal` (тримає) · `counterpulse` (контрпульс).

### Вісь B — Висота (дивиться на harmony)
*Які* ноти. Виводиться з гармонії:
- `strategy`: `root` · `root5` · `root5oct` · `arpeggio` (акордові тони) · `walking` · `chromaticApproach` · `pedal` · `riff`.
- `range` (MIDI-діапазон), `approachNotes`, `chordToneBias`.

**Доказ роздільності — тумбао:** понче (& 2-ї долі + 4-та доля) — чиста вісь A; а самі ноти ходять root→5th→octave за акордами монтуно — чиста вісь B. Один архетип = A × B. Саме тому модуль — шарнір між груву і гармонією.

> **Чесний MVP щодо висоти:** GGL не має гармонії. Тому за замовчуванням вісь B = `root5` від тоніки, яку задає користувач (key picker). Коли з'явиться `harmony`-модуль — вісь B живиться реальною прогресією (`harmonicContext.progression`). Вісь A повноцінна вже зараз (грув реальний). Це тримає обидва береги мосту чесними: ритм-берег готовий, висота-берег — заглушка з апгрейд-шляхом.

---

## 4. Модель даних

### 4.1 `BassArchetype` (каталог — джерело істини, `data/`)

```ts
BassArchetype {
  id: string;                          // "afrocuban.tumbao"
  names: { uk: string; en: string };
  grooveFamilies: string[];            // GGL families, які обслуговує: ["Afro-Cuban","Salsa and mambo"]
  meters: string[];                    // ["4-4"] | ["6-8","12-8"] | ["7-8"] ...
  region?: string; era?: { from?: number; to?: number };

  rhythm: {                            // ВІСЬ A
    anchorMode: "absolute" | "relativeToKick" | "relativeToClave";
    onsets: number[];                  // кроки (0-based, < stepsPerBar) або зміщення
    accents?: number[]; ghosts?: number[]; ties?: [number, number][];
    grooveLock: "lockKick" | "interlock" | "anticipate" | "pedal" | "counterpulse";
  };

  pitch: {                             // ВІСЬ B
    strategy: "root"|"root5"|"root5oct"|"arpeggio"|"walking"|"chromaticApproach"|"pedal"|"riff";
    range: { lowMidi: number; highMidi: number };
    approachNotes?: boolean; chordToneBias?: number;  // 0..1
  };

  bassDNA: BassDNA;                     // 7 осей, 0..1 (див. §6)
  fitConditions: FitRule[];            // коли цей архетип «✓» vs «⚠» (див. §5.3)

  principles: { title: I18n; text: I18n }[];   // навчальний шар (паритет із GGL)
  whyFits: FindingTemplateRef[];               // шаблони пояснень «чому пасує»
  sources: BibRef[];                           // ІНВАРІАНТ: min 1
  exemplars?: { track: string; artist: string; year?: number }[];
  tags: string[];
}
```

### 4.2 `BassPattern` (реалізація — render-ready, вихід движка)

```ts
BassPattern {
  styleId: string; meter: string; stepsPerBar: number; tempo: number;
  archetypeId: string;
  harmonicContext: { key: string; progression?: ChordEvent[] };
  notes: {
    step: number; midi: number; dur: number;         // dur у кроках
    accent: boolean; ghost: boolean;
    why: FindingRef;                                  // для explanation-overlay
  }[];
}
```

Один `BassPattern` → дві вітрини: **piano-roll** (сітка кроків × висота) і **notation** (VexFlow). Дані одні.

---

## 5. Groove → Bass Mapping Engine

Два чітко розділені шари. Плутати їх — означає скотитися в «AI-галюцинацію».

### 5.1 Шар A — Каталог (детермінований lookup)
`(family, meter) → BassArchetype[]`. Куровані дані. Гарантує, що пропонуються лише історично засвідчені рішення. Це «він знає історичні рішення», а не «вигадує».

### 5.2 Groove DNA (метрики з `seed`)
Усе обчислюється з масивів кроків `seed` на `stepsPerBar`-сітці. Кожна метрика прив'язана до джерела:

| Метрика | Визначення | Джерело |
|---|---|---|
| **kickAlignment** | розподіл онсетів кіка: частка на сильних долях vs «&» | — (геометрія долі) |
| **syncopation** | індекс синкопи за метричною ієрархією | Longuet-Higgins & Lee 1984 |
| **ghostDensity** | частка тихих/привидних онсетів (snare/rim low-velocity) | — |
| **accentStructure** | вектор акцентних груп (важливо для непарних метрів) | Brăiloiu (aksak) для 5/7/9/11 |
| **rhythmicWeight** | розподіл «ваги» по долях (центроїд щільності) | — |
| **grooveZone** | прогноз «грувовості» (Goldilocks) за синкопою | Vuust et al. 2014 |

### 5.3 Шар B — Scoring (DNA × архетип → `Finding`)
Для кожного кандидата з каталогу `fitConditions` зіставляються з Groove DNA → `fit ∈ [0,1]` і вердикт **✓ / ⚠**, кожен із `Finding`:

```ts
Finding { kind, severity, params, location?, citationIds[] }
// приклади kind:
//  "bass.locksKick"        — high kickAlignment ∧ grooveLock=lockKick      → ✓
//  "bass.fillsKickGaps"    — interlock пасує до рідкого кіка                → ✓
//  "bass.tooDenseForGroove"— density архетипа ≫ grooveZone                  → ⚠
//  "bass.fightsClave"      — онсети суперечать clave-направленню            → ⚠
```

Вихід движка:

```ts
recommendBass(groove: GrooveSelected, ctx?): {
  classification: { family: string; meter: string; confidence: number };
  grooveDNA: GrooveDNA;
  candidates: { archetype: BassArchetype; fit: number; verdict: "✓"|"⚠"; findings: Finding[] }[];
}
```

UI рендерить `candidates` як список «Recommended Bass Families» з ✓/⚠ і кнопкою «чому» (розгортає `findings` → `Explanation` + цитати).

---

## 6. Bass DNA (сім осей — обчислювані й цитовані)

Дзеркало Groove DNA, наведене на басовий трек. Усі 0..1.

| Вісь | Визначення | Примітка |
|---|---|---|
| **Rootedness** | частка онсетів на корені акорду | вісь B |
| **Motion** | середній інтервал руху між сусідніми нотами | вісь B |
| **Syncopation** | той самий індекс L-H&L, на бас-онсетах | **спільний движок із груву** |
| **Density** | онсетів на такт / stepsPerBar | вісь A |
| **Range** | діапазон у півтонах, нормований | вісь B |
| **GrooveLock** | **крос-кореляція онсет-вектора баса з кіком** | ключова: збіг→pocket, антифаза→interlock |
| **HarmonicWeight** | наскільки бас «несе» гармонію (корені на сильних долях) | вісь B |

> **GrooveLock** — найважливіша і найконкретніша: це нормована кореляція двох бінарних онсет-векторів (bass vs kick) на спільній сітці. Високий збіг = «замок»/pocket (фанк-pocket, дабовий one-drop корінь). Систематична антифаза = interlock (афробіт, відповідь тумбао). Це робить «Groove DNA» і «Bass DNA» **одним движком на два треки**.

### 6.1 ДНК-вектор і спорідненість (координата машини)

Сім осей → **7-вимірний вектор** `[R M S D Rg L H]` (0–9). Спорідненість двох архетипів = `1 − зважена_евклідова_відстань`, де **GrooveLock і Syncopation важать ×1.5** (структурні носії груву), Range ×0.5. Ця метрика живить UI-affinity-map і крос-жанрові кластери — напр. `techno.rootpulse` ↔ `march.oompah` (той самий замок кореня до долі через жанрову прірву).

> Повний ДНК-каталог (≈45 архетипів × 18 родин), кластери і «несподівані мости» — у супутнику **`GROOVE-BASS-TAXONOMY.md`**.

---

## 7. Таксономія — огляд

> **Канонічний повний каталог** — у супутнику **`GROOVE-BASS-TAXONOMY.md`**: ≈45 архетипів у 18 родинах, ДНК-вектори, крос-жанрові кластери, «несподівані мости» і джерела. Тут лише принцип і карта верхнього рівня.

Таксономія — це **(family × meter) → архетипи**, не просто family: GGL охоплює 2/4…13/8, тож бас для Afro-Cuban 4/4, bembe 12/8, rachenitsa 7/8 та Irish jig 6/8 — різні архетипи.

**18 bass-родин** (повна карта з GGL-відповідностями — TAXONOMY.md §B):

> Tumbao/anticipated · Latin-pop anticipated · Syncopated pocket · Sparse root · Riddim/digital · Ostinato/interlock · Surdo/pulse · Walking · Waltz/triple · Aksak ostinato · Compound root-drone · Shuffle/12-8 · Four-on-floor · Disco octaves · Sub/displaced · Oom-pah · Minimal/pedal · Tala-follow.

Виправлення проти ранньої чернетки (внесені в каталог): **тарантела** → Compound (не Surdo); **Disco octaves** виділено окремо; **dancehall** відколото від dub у Riddim/digital; **Jazz** поділено за метром (4/4 walking ≠ 3/4 waltz); **bossa/samba** розведено; **електроніка** — повноправні родини.

Кожен архетип = вісь A (ритм, §3) × вісь B (висота, §3) + ДНК-вектор (§6.1) + `fitConditions` (✓/⚠, §5.3) + `principles` + `sources`. Наскрізний приклад (Tumbao: понче на кроках 6 і 12, анте; корінь на 12 — наступного акорду) — TAXONOMY.md §C.1.

---

## 8. UI — вкладка «Groove-Bass»

Окрема вкладка поряд із GGL. Макет (dark, gallery-core, як решта MELOS):

```
┌ Groove-Bass Lab ───────────────────────────────────────────────┐
│ [синхр. зі стилем GGL: "Afro-Cuban · 4/4 · ♩=120"]   [key: Am ▾]│
├─────────────────────────────────────────────────────────────────┤
│  Recommended bass families            │  Bass DNA (радар)        │
│   ✓ Tumbao            (fit .86) [чому]│   rootedness ▓▓▓░░       │
│   ✓ Son montuno bass  (fit .78) [чому]│   syncopation ▓▓▓▓░      │
│   ⚠ Walking bass      (fit .31) [чому]│   grooveLock ▓▓░░░       │
├─────────────────────────────────────────────────────────────────┤
│  PIANO-ROLL (stepsPerBar-сітка GGL × висота)     [notation ⇄]    │
│  kick-онсети показані сірим тлом для наочного locking            │
│  ноти баса: акцент=яскравіше, ghost=тьмяно, hover→"why"          │
├─────────────────────────────────────────────────────────────────┤
│  Info box: походження · епоха · регіон · exemplar-треки · cite   │
│  Principles: [title — text] ×N        [▷ play]  [⇄ compare]      │
└─────────────────────────────────────────────────────────────────┘
```

Обов'язково:
- **kick-онсети підкладкою** під піано-рол — щоб «groove lock» було видно очима (де бас збігається з кіком, де заповнює проміжки).
- **piano-roll ⇄ notation** перемикач (одні дані, дві вітрини).
- **«чому»** біля кожного ✓/⚠ → розгортає `Finding`-пояснення + цитату.
- **per-note hover** → чому ця нота тут (lock/anticipate/fill/approach).
- усі тексти uk/en.

---

## 9. Гармонічний контекст: акордовий трек (first-class, не «колись»)

Вісь B живиться **акордовим треком** `SongContext.chords` (§2.5) — користувач ставить акорди на потрібні долі (снеп до сітки) вже зараз, вручну, **незалежно** від модуля `harmony`. Бас для кожного онсета бере акорд, активний на його тіку:

- `root` → корінь активного акорду; `root5`/`root5oct` → +квінта (+октава);
- `walking`/`chromaticApproach` → ціляться в корінь *наступного* акорду з підходами;
- `arpeggio` → акордові тони активного акорду.

- **Fallback:** немає акордового треку → тоніка `SongContext.key` (бас усе одно демонструє ритмічно-стильову логіку повноцінно).
- **Апгрейд (коли є `harmony`):** модуль автоматично *наповнює/пропонує* той самий `chords`-трек (гармонізація). Формат не змінюється, вісь A не чіпається.
- Це прямо реалізує тезу §0: ритм-берег готовий, висота-берег апгрейдиться.

---

## 10. Дорожня карта реалізації

| Крок | Де | Що | Залежності |
|---|---|---|---|
| **R0** | `F:\BASS_DNA` (sandbox) | Headless движок: типи `SongContext`/`ChordEvent`/`BassArchetype` + конвертер крок↔тік + Groove DNA з реальних `seed` GGL + scoring + родина **Tumbao** + реалізатор `BassPattern` (вісь B читає **акордовий трек**). Тести проти живих стилів GGL. | — |
| **R1** | sandbox | ASCII піано-рол (kick-підкладка + bass + акорди) для очної перевірки lock'у | R0 |
| **R2 ✅** | MELOS `packages/groove-bass` | **Зроблено.** Згорнуто в самодостатній TS-пакет `@melos/groove-bass` (Tonal.js + Zod + vitest), папки-шари `transport/harmony/analysis/data/pedagogy/view`. Строгий typecheck OK, 7/7 тестів. Інваріант ≥1 цитата — у Zod-схемі+тесті. Виправлено wart R1 (out-of-family Finding). | R1 |
| **R3a ✅** | `packages/groove-bass/preview` | **Зроблено.** Самодостатній Vite-прев'ю: SVG piano-roll + kick-підкладка, акордова дорішка, dropdown реальних GGL-стилів → бас живцем, панель ✓/⚠ + principles, Web-Audio відтворення (бас+кік). TS OK (strict+DOM), `vite build` OK. | R2 |
| **R3b ✅** | `apps/web` (`components/GrooveBass.tsx`) | **Зроблено.** Вкладка «Groove-Bass» у реальному MELOS: читає живий `GroovePattern` з GrooveLab (events→seed), показує DNA + ✓/⚠ + principles + цитати + ДНК-сусідів, SVG piano-roll + **VexFlow-нотація** (toggle). Workspace НЕ потрібен — `apps/web` уже резолвить `@melos/*` через Vite-аліаси; додав аліас + tsconfig-path на `groove-bass`. WEB TS OK, build OK. | R3a |

> **Уточнення стану MELOS:** `apps/web` — не скелет, а зрілий React-додаток (Mode Explorer, Composer's Lab, Motif, Rhythm Designer, **Groove Lab**, Ear Training, Reference Library) з готовими piano-roll + VexFlow і потоком `drumPattern` GrooveLab→ComposerLab. Пакети `@melos/*` мають `src/` (рання оцінка «скелет без коду» була через `find -maxdepth 3`, що не діставав глибину 4). Крос-пакетні імпорти — через Vite-аліаси (не pnpm-workspace).
| **R4 ✅** | `data/families/*` + `analysis/affinity` | **Зроблено.** ~41 архетип у 15+ родинах, метри 2/4·3/4·4/4·5/8·6/8·7/8. fit-примітиви (anticipation/pocket/sparse/interlock/fourFloor/walking/oompah/fixed). **ДНК-affinity** (крос-жанрові сусіди) у движку й превью. Рекомендатор реагує на метр (7/8→aksak) і на seed (four-on-floor→techno/disco, не tumbao). Інваріант цитат — на ВЕСЬ каталог. CORE+PREVIEW TS OK, 11/11. | R2 |
| **R5 ✅** | `apps/web` `GrooveBass.tsx` | **Зроблено.** Кнопка **Play** + 3 баси (бас-гітара пікінг / контрабас / орган-бас) через **smplr** MusyngKite-саундфонти + кік-клік (lock чутно). Планувальник підхоплює правки наживо. | R3b |
| **R6 (½)** | `core-*`/`data` | Промоушн папок-шарів. **Зроблено (прероблено):** архетипи → **чисті дані**, `fit` → реєстр в `analysis` (`{kind}`/`{fixed,note}`), цикл **data↔analysis розірвано**, повна Zod-валідація всього каталогу. **Лишилось:** фізичне перенесення файлів у спільні пакети + `file:`-деп/`npm install` (фасад `@melos/groove-bass` лишається). | R5 |
| **backlog** | data | Shuffle 12/8, dancehall-riddim, ще aksak (9/8·11/8·13/8), Carnatic (stub); калібрування порогів/ваг; мікшер + метроном (окремі секції) | — |

R0 — критичний шлях: маленький вертикальний зріз (одна родина) доводить весь концепт headless і тестовано, точно за тезою MELOS «core-first».

---

## 11. Відкриті питання / кураторський беклог

1. **Наповнення таксономії** — як і в MELOS загалом (ARCHITECTURE §11.1), це праця музикознавця, не код. Слоти визначені (§7.1); кожен архетип потребує `principles` + `sources` + exemplar-треків. Інкрементно.
2. **Anchor для clave-залежних архетипів** — чи виводити clave автоматично з `seed.rim`/`seed.perc`, чи брати з GGL-`tags`? (Пропозиція: спершу з tags, потім детектор.)
3. **Скоринг ⚠/✓ пороги** — потребують калібрування на реальних GGL-стилях (blind-перевірка, як earworm-метрики в MELOS §11.4).
4. **Назва** — `groove-bass` vs ширше `rhythm-section`. Пропозиція: пакет `groove-bass`, концептуально лишити двері до rhythm-section.
5. **Гармонія до появи `harmony`** — чи дозволяти ручне введення простої прогресії в key picker уже на R3 (щоб walking/arpeggio були демонстровні)?

---

## 12. Що модуль НЕ робить (межі, за духом ARCHITECTURE §12)

- Не «генерує бас одним кліком як фінал». Він **пропонує архетипи й пояснює**.
- Жодного архетипа без `sources[]`.
- Не вигадує стилі: рекомендує лише з курованого каталогу (+ чесний ⚠, коли нічого добре не лягає).
- Не приймає музичних рішень «магічно»: кожне ✓/⚠ = `Finding` із параметрами і цитатою.
