/**
 * MELOS Design Tokens
 *
 * Естетика: Dark Academic · Modern Musicology · Minimalist Laboratory
 * Принцип: спокійний серйозний музичний інструмент.
 * Заборонено: неон, RGB, геймерський вигляд, декоративні/техно-шрифти.
 */

// ──────────────────────── КОЛЬОРИ ────────────────────────

export const color = {
  /** Основний фон — Deep Graphite */
  bgBase: "#16181C",
  /** Панелі — Slate Black */
  bgPanel: "#1D2126",
  /** Другорядні поверхні — Soft Anthracite */
  bgSurface: "#252A31",

  /** Основний текст — Warm White */
  textPrimary: "#E8E6E3",
  /** Другорядний текст — Muted Silver */
  textSecondary: "#9DA4AF",

  /**
   * Dusty Amber — головний акцент.
   * Активний такт, поточна позиція, вибраний елемент, кнопка Play.
   */
  accent: "#D7A24A",

  /**
   * Petrol Blue — другий акцент.
   * Виділення структур, аналіз, інформаційні блоки.
   */
  accentBlue: "#5F8EA8",

  /**
   * Forest Green — третій акцент.
   * Підтвердження, стабільні метричні точки, опорні долі.
   */
  accentGreen: "#5E8D71",
} as const;

// ──────────────────────── ТИПОГРАФІКА ────────────────────────

export const font = {
  /** UI-шрифт (основний) */
  sans: "'Inter', 'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  /** Моноширинний (код, інтервали, формули) */
  mono: "'IBM Plex Mono', 'JetBrains Mono', monospace",
  /** Музичні символи (SMuFL-сумісні) */
  music: "'Bravura', 'Petaluma', serif",
} as const;

// ──────────────────────── РОЗМІРИ ТЕКСТУ ────────────────────────

export const fontSize = {
  xs: "0.75rem",   // 12px — лейбли, капшени
  sm: "0.8125rem", // 13px — другорядний контент
  base: "0.875rem",// 14px — основний текст (компактний «лабораторний» вигляд)
  md: "1rem",      // 16px — акцентний текст
  lg: "1.25rem",   // 20px — заголовки секцій
  xl: "1.5rem",    // 24px — заголовки модулів
  xxl: "2rem",     // 32px — заголовок сторінки
} as const;

// ──────────────────────── ПРОСТІР ────────────────────────

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem",  // 8px
  3: "0.75rem", // 12px
  4: "1rem",    // 16px
  5: "1.25rem", // 20px
  6: "1.5rem",  // 24px
  8: "2rem",    // 32px
  10: "2.5rem", // 40px
  12: "3rem",   // 48px
  16: "4rem",   // 64px
} as const;

// ──────────────────────── РАДІУСИ ────────────────────────

export const radius = {
  none: "0",
  sm: "2px",
  md: "4px",
  lg: "6px",
  xl: "8px",
  full: "9999px",
} as const;

// ──────────────────────── ТІНІ ────────────────────────

export const shadow = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
  md: "0 2px 8px rgba(0, 0, 0, 0.4)",
  lg: "0 4px 16px rgba(0, 0, 0, 0.5)",
} as const;

// ──────────────────────── ПЕРЕХОДИ ────────────────────────

export const transition = {
  fast: "100ms ease",
  base: "200ms ease",
  slow: "400ms ease",
} as const;

// ──────────────────────── СЕМАНТИЧНІ РОЛІ ────────────────────────

export const semantic = {
  /** Активний такт / поточна позиція у piano roll */
  playhead: color.accent,
  /** Виділений елемент (нота, каденція, інтервал) */
  selected: color.accent,
  /** Аналітична підсвітка (структури, роз'яснення) */
  analysis: color.accentBlue,
  /** Інформаційний блок, tooltip */
  info: color.accentBlue,
  /** Стабільні метричні точки, підтвердження, «правильно» */
  stable: color.accentGreen,
  /** Опорні долі в ритмічній сітці */
  downbeat: color.accentGreen,
} as const;
