/** Нормалізація pitch-class до 0–11. */
export function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/** Відстань у семітонах від a до b (вгору, 0–11). */
export function semitoneDistance(a: number, b: number): number {
  return mod12(b - a);
}
