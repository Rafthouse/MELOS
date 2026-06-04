// Префіксує всі селектори GGL CSS під .ggl-root, щоб ізолювати стилі.
// Запуск: node scripts/prefix-css.mjs <input> <output>
import { readFileSync, writeFileSync } from "node:fs";

const PREFIX = ".ggl-root";

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error("usage: prefix-css.mjs <input> <output>");
  process.exit(1);
}

const css = readFileSync(input, "utf8");

// Простий парсер на блоки: знаходимо `<selectors> { ... }`, де <selectors> можуть
// бути комбінаціями через коми. :root / @media / @keyframes — лишаємо як є.
const out = css.replace(/([^{}\/]+)\{/g, (match, selectorList) => {
  const trimmed = selectorList.trim();

  // At-rules (@media, @keyframes) — пропустити (внутрішні блоки оброблюємо при наступному виклику)
  if (trimmed.startsWith("@")) return match;

  // :root → переносимо custom props ПІД .ggl-root, щоб не перебивати MELOS-токени
  if (trimmed === ":root") return `${PREFIX} {`;

  // Keyframes-кадри (0%, 50%, from, to) — лишити
  if (/^(\d+%|from|to)(\s*,\s*(\d+%|from|to))*$/.test(trimmed)) return match;

  const prefixed = trimmed
    .split(",")
    .map((sel) => {
      sel = sel.trim();
      if (!sel) return sel;
      // * reset
      if (sel === "*" || sel.startsWith("*")) return `${PREFIX} ${sel}`;
      // body → .ggl-root
      if (sel === "body" || sel === "html") return PREFIX;
      // Уже містить наш префікс — не подвоюємо
      if (sel.startsWith(PREFIX)) return sel;
      // Псевдоелементи на голому селекторі
      return `${PREFIX} ${sel}`;
    })
    .join(", ");

  return `${prefixed} {`;
});

writeFileSync(output, out, "utf8");
console.log(`prefixed: ${input} → ${output}`);
