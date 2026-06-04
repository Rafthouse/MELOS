# Groove-Bass Lab — Повний каталог архетипів і ДНК-карта спорідненостей

> Статус: кураторський каталог (дані, не код). Супутник до `GROOVE-BASS-LAB.md`.
> Призначення: **серйозна аналітично-педагогічна машина**, не буквар. Усі GGL-родини, усі метри, електроніка включно.
> Кожен архетип несе ДНК-вектор → це координати для карти спорідненостей (§E) і для UI-affinity-map.
> Інваріант MELOS: жоден архетип без `sources[]`. Тут джерела згруповані за родинами (§G); у `data/` кожен запис цитує точково.

---

## A. ДНК-простір (координати машини)

Кожен архетип — точка у 7-вимірному просторі **Bass DNA**. Нотація вектора:

```
[ R  M  S  D  Rg  L  H ]   кожна вісь 0–9
  │  │  │  │  │   │  └ HarmonicWeight — наскільки бас «несе» гармонію (корені на сильних)
  │  │  │  │  │   └── GrooveLock — крос-кореляція онсетів баса з кіком (9=унісон, 0=антифаза)
  │  │  │  │  └────── Range — діапазон руху у півтонах (норм.)
  │  │  │  └───────── Density — онсетів на такт / stepsPerBar
  │  │  └──────────── Syncopation — індекс L-H&L на бас-онсетах
  │  └─────────────── Motion — середній інтервал кроку (мелодичність лінії)
  └────────────────── Rootedness — частка онсетів на корені акорду
```

**Спорідненість** двох архетипів = `1 − wdist(a,b)`, де `wdist` — зважена евклідова відстань по 7 осях. Ваги нерівні: **GrooveLock і Syncopation важать більше** (×1.5) — це структурні носії груву; Range важить менше (×0.5). Саме ця метрика живить:
- **affinity-map** у UI (споріднені баси як граф/сусідство);
- **крос-жанрові кластери** (§E) — коли далекі за жанром архетипи виявляються ДНК-родичами;
- **рекомендацію-сусіда** («якщо ✓ Tumbao, спробуй також його ДНК-сусіда — Bossa»).

> Вектори нижче — **декларовані сіди** (експертна оцінка). У рантаймі движок перераховує їх із реалізованого `BassPattern` (§6 специфікації); сід-вектор = валідаційний еталон і fallback.

---

## B. Карта родин (повна, з виправленнями)

Виправлено проти чернетки §7.1 специфікації: тарантела → compound (не samba); disco-octaves виділено; dancehall відколото від dub; jazz поділено за метром; bossa/samba розведено. Електроніка — повноправна.

| # | Bass-family | GGL groove families | Метри |
|---|---|---|---|
| 1 | **Tumbao / anticipated** | Afro-Cuban, salsa/mambo, son | 4/4, 6/8, 12/8 |
| 2 | **Latin-pop anticipated** | bossa, cumbia, reggaeton/dembow | 4/4 |
| 3 | **Syncopated pocket** | American funk | 4/4 |
| 4 | **Sparse root** | reggae, dub | 4/4 |
| 5 | **Riddim / digital** | dancehall | 4/4 |
| 6 | **Ostinato / interlock** | afrobeat, highlife | 4/4, 12/8 |
| 7 | **Surdo / pulse** | samba | 2/4 |
| 8 | **Walking** | jazz swing, bebop, gospel, second line | 4/4, 5/4 |
| 9 | **Waltz / triple** | classical waltz, jazz waltz, mazurka | 3/4 |
| 10 | **Aksak ostinato** | усі Balkan/odd (paidushko, rachenitsa, kalamatianos, karsilama, kopanitsa, gankino, Turkish/Balkan 10/8, Balkan 13/8, jazz/prog 5/4–13/8) | 5/8,7/8,9/8,10/8,11/8,13/8,5/4 |
| 11 | **Compound root-drone** | Irish jig, tarantella, blues 6/8, bembe 6/8 | 6/8, 12/8 |
| 12 | **Shuffle / 12-8** | blues 12/8, gospel 12/8 | 12/8 |
| 13 | **Four-on-floor** | house, techno, electro, European dance | 4/4 |
| 14 | **Disco octaves** | disco | 4/4 |
| 15 | **Sub / displaced** | breakbeat, jungle/DnB, halftime, electro-808 | 4/4 |
| 16 | **Oom-pah** | march, polka | 2/4 |
| 17 | **Minimal / pedal** | experimental minimalism | будь-який |
| 18 | **Tala-follow** *(окрема система)* | Carnatic 13/8 | 13/8 |

---

## C. Каталог архетипів

Формат: `id` · назва · grooveLock · pitch-strategy · ДНК `[R M S D Rg L H]` · *exemplar* — однорядковий принцип.
Кроки — на `stepsPerBar`-сітці метра (4/4→16, 2/4→8, 6/8→12, 7/8→14, 12/8→24…).

### 1. Tumbao / anticipated (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `tumbao` | anticipate | root5oct | `5 4 7 4 4 3 6` | Cachao; *Buena Vista* |
| `son.montuno` | anticipate | root5 | `6 3 6 4 3 4 6` | Arsenio Rodríguez |
| `salsa.modern` | interlock | root5oct+approach | `4 5 7 5 4 3 5` | Oscar D'León |
| `timba` | interlock | arpeggio+gap | `4 5 8 6 4 3 5` | Los Van Van |

Понче: крок **6** («& 2-ї долі») + крок **12** (4-та доля); крок 12 несе корінь **наступного** акорду (anticipación). Принцип: «бас грає *перед* долею, не на ній — звідси тяга».

### 2. Latin-pop anticipated (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `bossa.rootfifth` | pedal/anticipate | root5 | `7 2 5 3 3 4 7` | Jobim; *Garota de Ipanema* |
| `cumbia.chucu` | lockKick+offbeat | root5 | `6 3 5 4 3 5 6` | Los Corraleros |
| `dembow.reggaeton` | lockKick | root | `7 2 6 4 2 6 6` | дембоу boom-ch-boom-chick |

### 3. Syncopated pocket — Funk (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `funk.jamerson` | lockKick+interlock | chromaticApproach | `3 6 8 7 5 5 5` | *Standing in the Shadows of Motown* |
| `funk.bootsy_one` | lockKick (beat 1) | root | `7 3 6 4 4 8 6` | «the One» — JB/P-Funk |
| `funk.pocket` | lockKick | root5 | `7 2 5 4 3 8 6` | Pino Palladino (pocket) |
| `funk.neosoul` | interlock (laid back) | chordTones+ghost | `4 5 7 5 5 4 5` | D'Angelo *Voodoo* |
| `funk.pfunk` | interlock | riff+sub | `5 4 7 5 5 4 5` | Bootsy *Mothership* |

> `pocket` і `pfunk` обидва лишені (твоє питання з минулого кроку): canonical-розріз = **Jamerson / Bootsy-the-One / P-Funk / Neo-Soul**, а `pocket` тримаю як ДНК-вузол максимального lock (він — центр lock-кластера §E).

### 4. Sparse root — Reggae/Dub (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `reggae.onedrop` | lockKick (beat 3) | root | `8 2 4 2 2 7 7` | one-drop, мовчання на «1» |
| `dub.root` | lockKick + ties | root | `8 1 3 2 2 7 8` | Aston «Familyman» Barrett |
| `dub.space` | counterpulse | root5 | `7 2 5 1 3 5 7` | King Tubby — простір/ехо |
| `dub.pulse` | lockKick | root | `7 2 3 5 2 6 7` | рівний восьмий пульс |
| `dub.delayed` | anticipate (echo-shift) | root | `6 3 6 3 3 3 6` | бас, зміщений під дилей |

> `dub.delayed` повернено (твоє питання) — четвертий канонічний дабовий підхід.

### 5. Riddim / digital — Dancehall (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `dancehall.slengteng` | lockKick | root | `8 2 5 4 2 7 6` | Sleng Teng (1985) — перший digital riddim |
| `dancehall.modern` | lockKick | root+octave | `7 3 6 4 3 6 6` | сучасні riddim-и |

### 6. Ostinato / interlock — Afrobeat (4/4=16; також 12/8)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `afrobeat.fela` | interlock | riff (modal) | `5 5 6 5 4 2 5` | Fela — *Water No Get Enemy* |
| `afrobeat.highlife` | interlock | arpeggio | `4 6 5 5 5 3 5` | E.T. Mensah |
| `afrobeat.modern` | interlock | riff+approach | `5 5 7 6 4 3 5` | Antibalas |

### 7. Surdo / pulse — Samba (2/4=8)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `samba.surdo` | lockKick (beat 2) | root5 | `8 2 4 4 2 7 7` | бас веде сурду; 2-га доля важча за 1-шу |

### 8. Walking (4/4=16; 5/4=20)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `jazz.walking` | counterpulse | walking | `2 8 2 8 6 4 4` | Ray Brown, Paul Chambers |
| `bebop.walking` | counterpulse | walking+chromatic | `2 8 3 8 6 4 4` | Ron Carter |
| `gospel.walking` | lockKick | walking+arpeggio | `3 7 4 7 6 5 5` | gospel/soul bass |
| `secondline.street` | interlock | walking+syncopation | `3 6 5 6 5 5 5` | New Orleans — George Porter Jr. |

### 9. Waltz / triple (3/4=12)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `waltz.oompahpah` | lockKick (beat 1) | root then 5 | `8 3 2 4 3 6 7` | віденський вальс — корінь на «1» |
| `waltz.jazz` | interlock | arpeggio | `4 6 3 5 5 4 5` | jazz waltz — *My Favorite Things* |
| `waltz.mazurka` | lockKick (beat 2/3) | root5 | `6 4 4 4 3 5 6` | акцент зміщено на 2-гу/3-тю долю |

### 10. Aksak ostinato (параметрично за групуванням)
Один архетип-родина, керований **accent-grouping** метра. Бас замикається на початки адитивних груп.
ДНК baseline: `[6 3 5 4 3 6 6]` (lock високий, бо бас «промовляє» метр).

| id | метр (steps) | групування | онсети на початках груп |
|---|---|---|---|
| `aksak.paidushko` | 5/8 (10) | 2+3 | 0, 4 |
| `aksak.rachenitsa` | 7/8 (14) | 2+2+3 | 0, 4, 8 |
| `aksak.kalamatianos` | 7/8 (14) | 3+2+2 | 0, 6, 10 |
| `aksak.karsilama` | 9/8 (18) | 2+2+2+3 | 0, 4, 8, 12 |
| `aksak.kopanitsa` | 11/8 (22) | 2+2+3+2+2 | 0, 4, 8, 14, 18 |
| `aksak.gankino` | 11/8 (22) | 2+2+3+2+2 | (варіант акцентів) |
| `aksak.turkish10` | 10/8 (20) | 3+2+2+3 | 0, 6, 10, 14 |
| `aksak.balkan13` | 13/8 (26) | 4+4+5 (варіює) | 0, 8, 16 |

Принцип: «у непарному метрі бас спелінгує адитивні групи — він робить метр відчутним, а не ховає його».

### 11. Compound root-drone (6/8=12; 12/8=24)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `compound.jigdrone` | pedal | root5 drone | `8 3 3 3 3 6 7` | Irish jig — бузукі/бас вамп; рух = зміна акорду |
| `compound.tarantella` | lockKick | root5 | `7 4 4 4 3 6 6` | пд.-італ. 6/8, швидший драйв |
| `compound.blues68` | lockKick | root5+arpeggio | `6 4 4 5 4 5 6` | slow blues 6/8 |
| `compound.bembe` | interlock | root5 (bell-lock) | `5 4 6 4 3 3 5` | Afro-Cuban 6/8 — замок на дзвін |

### 12. Shuffle / 12-8 (12/8=24)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `shuffle.blues12` | lockKick | walking-triplet | `5 5 4 6 5 5 6` | slow blues shuffle |
| `shuffle.gospel12` | interlock | walking+arpeggio | `4 6 4 7 6 5 5` | gospel 12/8 |

### 13. Four-on-floor (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `house.offbeat` | counterpulse (antiphase) | root | `7 3 5 5 3 2 6` | бас на «&» між кіками — «pump» |
| `techno.rootpulse` | lockKick | root | `8 2 3 5 2 8 6` | Berlin techno — лок до four-on-floor |
| `eurodance.drive` | lockKick | root+octave | `7 3 4 5 3 6 6` | European dance |

### 14. Disco octaves (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `disco.octaves` | lockKick + motion | root↔octave | `6 6 4 7 7 6 6` | Bernard Edwards (Chic) — *Good Times* |

> ДНК disco — навмисно «гібридна»: водночас **lock** (L6) і **motion** (M6, Rg7). Це міст між four-on-floor і walking (див. §E).

### 15. Sub / displaced (4/4=16)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `dnb.reese` | counterpulse | root sustain | `7 2 4 2 4 3 7` | jungle/DnB — sub/Reese |
| `breakbeat.sub` | interlock | root+approach | `6 3 6 3 4 3 6` | breakbeat |
| `halftime.displaced` | pedal | root | `6 3 5 2 4 4 6` | halftime bass |
| `electro.808` | interlock | root+slide | `6 4 7 4 4 4 6` | electro — синкопований 808/слайд |

### 16. Oom-pah (2/4=8)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `march.oompah` | lockKick | root↔5 на долях | `9 2 1 4 3 8 8` | марш — корінь/квінта на 1–2 |
| `polka.oompah` | lockKick | root↔5 | `9 2 2 4 3 8 7` | полька |

### 17. Minimal / pedal (будь-який)
| id | grooveLock | pitch | ДНК | exemplar |
|---|---|---|---|---|
| `minimal.pedal` | pedal | held root | `9 1 2 2 1 5 8` | витриманий корінь; вага без руху |

### 18. Tala-follow — Carnatic *(окрема система, потребує етномузикологічної курації)*
| id | grooveLock | pitch | ДНК | примітка |
|---|---|---|---|---|
| `carnatic.tala` | lock до anga | follow tala | `6 4 6 5 3 5 6` | бас слідує структурі anga тали; **STUB** — потребує джерел (Nelson, *Solkattu Manual*) |

**Разом: ~45 архетипів у 18 родинах** (+ параметричні aksak-варіанти).

---

## D. ДНК-таблиця (зведена — для affinity-обчислень)

Скорочено, відсортовано за **GrooveLock** (вісь L), щоб видно було «вісь замку» — від антифази до унісону з кіком:

| L | id | вектор `[R M S D Rg L H]` | кластер (§E) |
|---|---|---|---|
| 2 | afrobeat.fela | `5 5 6 5 4 2 5` | Interlock |
| 2 | house.offbeat | `7 3 5 5 3 2 6` | Interlock |
| 3 | tumbao | `5 4 7 4 4 3 6` | Anticipation |
| 3 | salsa.modern | `4 5 7 5 4 3 5` | Anticipation |
| 3 | dub.delayed | `6 3 6 3 3 3 6` | Sparse-sustain |
| 3 | dnb.reese | `7 2 4 2 4 3 7` | Sparse-sustain |
| 3 | compound.bembe | `5 4 6 4 3 3 5` | Interlock |
| 4 | jazz.walking | `2 8 2 8 6 4 4` | Motion |
| 4 | funk.neosoul | `4 5 7 5 5 4 5` | Anticipation/Pocket |
| 5 | funk.jamerson | `3 6 8 7 5 5 5` | Pocket/Motion |
| 5 | secondline.street | `3 6 5 6 5 5 5` | Motion |
| 6 | disco.octaves | `6 6 4 7 7 6 6` | **міст** Lock↔Motion |
| 6 | aksak.* | `6 3 5 4 3 6 6` | Aksak |
| 6 | compound.jigdrone | `8 3 3 3 3 6 7` | Drone |
| 7 | reggae.onedrop | `8 2 4 2 2 7 7` | Lock-anchor |
| 7 | dub.root | `8 1 3 2 2 7 8` | Sparse/Lock |
| 7 | samba.surdo | `8 2 4 4 2 7 7` | Lock-anchor |
| 7 | dancehall.slengteng | `8 2 5 4 2 7 6` | Lock-anchor |
| 8 | techno.rootpulse | `8 2 3 5 2 8 6` | Lock-anchor |
| 8 | funk.pocket | `7 2 5 4 3 8 6` | Lock-anchor |
| 8 | funk.bootsy_one | `7 3 6 4 4 8 6` | Lock-anchor |
| 8 | march.oompah | `9 2 1 4 3 8 8` | Lock-anchor |

---

## E. Крос-жанрові ДНК-кластери (ядро машини)

Кластери виникають із векторів §D, **не** з жанрів. Це і є аналітичний payload: глибока структурна спорідненість попри жанрову відстань.

**1. Lock-anchor** (L≥7, R≥7): `march.oompah · polka · techno.rootpulse · funk.pocket · funk.bootsy_one · reggae.onedrop · dub.root · samba.surdo · dancehall.slengteng · minimal.pedal`
→ *«бас = висота кіка». Корінь на сильних, унісон із бочкою.*

**2. Anticipation** (L≤4, S≥5, H≥6): `tumbao · son.montuno · salsa.modern · timba · bossa.rootfifth · cumbia.chucu`
→ *«бас нахиляється перед долею». Латинський анте-континуум.*

**3. Interlock** (L≤3, заповнює проміжки кіка): `afrobeat.fela · afrobeat.highlife · house.offbeat · compound.bembe · salsa.modern`
→ *«бас грає дірки». Антифаза як принцип.*

**4. Motion** (M≥6, D≥6, R≤4): `jazz.walking · bebop.walking · gospel.walking · shuffle.gospel12 · disco.octaves · afrobeat.highlife`
→ *«бас — це безперервна лінія». Рух важливіший за корінь.*

**5. Sparse-sustain** (D≤3, M≤3): `dub.root · dub.space · dnb.reese · halftime.displaced · minimal.pedal`
→ *«бас як витримана вага й простір». Тиша між подіями — частина грамоти.*

**6. Aksak** (адитивний метр, L≥6): усі `aksak.*`
→ *«бас спелінгує адитивні групи». Замок не до кіка, а до accent-cycle.*

**7. Drone** (compound, R≥7, L≥6): `compound.jigdrone · compound.tarantella · compound.blues68`
→ *«бас тримає складену пульсацію коренем-квінтою». Рух = зміна акорду.*

---

## F. Несподівані мости (педагогічне золото)

Найцінніші ребра affinity-графа — ті, що з'єднують далеке. Кожне — готовий міні-урок:

| Ребро | Спільне ДНК | Урок |
|---|---|---|
| `techno.rootpulse` ↔ `march.oompah` | L8, R8–9, S низький | «Техно перевідкрило марш: той самий замок кореня до долі через 150 років і жанрову прірву». |
| `afrobeat.fela` ↔ `house.offbeat` | L2, interlock | «Афробіт і хаус грають однаково — *дірки* кіка. Антифаза як двигун». |
| `disco.octaves` ↔ `jazz.walking` | M6–8, Rg6–7 | «Диско-бас — це walking-лінія, прибита до підлоги: рух джазу + замок танцполу». |
| `dub.root` ↔ `dnb.reese` | D2, sustain, sub | «Джангл успадкував філософію басу від дабу: вага й простір, не біг». |
| `tumbao` → `cumbia.chucu` → `dembow.reggaeton` | anticipation, що твердне в lock | «Той самий анте: від кубинської тяги до колумбійського чучу до пуерто-риканського замку дембоу». |
| `funk.jamerson` ↔ `secondline.street` | M6, S5–8, D6–7 | «Новоорлеанський street-бас і Моутаун — одна школа синкопованого руху». |

Ці мости — те, що affinity-map має підсвічувати: «✓ обрав Tumbao? Його далекий ДНК-родич — Dembow. Послухай чому».

---

## G. Джерела (за родинами; точкові цитати — у `data/`)

- **Tumbao/Latin:** Peñalosa, *The Clave Matrix* (2009); Mauleón, *Salsa Guidebook* (1993).
- **Latin-pop:** McGowan & Pessanha, *The Brazilian Sound* (1998); Manuel, *Caribbean Currents* (2006); W. Marshall, «Dem Bow» (genealogy of dembow).
- **Funk:** Slutsky & Jamerson, *Standing in the Shadows of Motown* (1989); Danielsen, *Presence and Pleasure: The Funk Grooves of James Brown and Parliament* (2006).
- **Reggae/Dub/Dancehall:** Veal, *Dub* (2007); Manuel & Marshall on dancehall riddims.
- **Afrobeat:** Veal, *Fela* (2000).
- **Samba:** McGowan & Pessanha (1998).
- **Walking/Jazz/Second line:** Goldsby, *The Jazz Bass Book* (2002); Berliner, *Thinking in Jazz* (1994).
- **Aksak/Balkan:** Brăiloiu, *Le rythme aksak* (1952); London, *Hearing in Time* (2004).
- **Irish/Compound:** Vallely (ed.), *Companion to Irish Traditional Music* (2011); Williams, *Focus: Irish Traditional Music* (2009).
- **Electronic (house/techno/disco/DnB):** Butler, *Unlocking the Groove* (2006).
- **Carnatic:** Nelson, *Solkattu Manual* (2014). *(розділ STUB)*
- **Метрики:** Longuet-Higgins & Lee (1984) — syncopation; Vuust et al. (2014) — groove sweet spot.

---

## H. Кураторський статус

| Стан | Родини |
|---|---|
| **Повні** (ДНК+pitch+lock+exemplar+джерело) | Tumbao, Latin-pop, Funk, Reggae/Dub, Dancehall, Afrobeat, Samba, Walking, Waltz, Aksak, Compound, Shuffle, Four-on-floor, Disco, Sub/displaced, Oom-pah, Minimal |
| **Stub** (потребує джерел/exemplar) | Carnatic tala-follow |
| **Потребує калібрування** | пороги ✓/⚠ у `fitConditions`; ваги affinity-метрики — на реальних GGL-стилях (blind-перевірка) |

> Наступний крок наповнення: розширити кожен «exemplar» до 2–3 треків із роком і таймкодом ключової фрази (як `canonicalExamples` у MELOS) — щоб info-box і «slow-listening» працювали.
