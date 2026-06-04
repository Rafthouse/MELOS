import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Аліаси на src пакетів монорепо.
 *
 * Замість file:-залежностей (які потребують pnpm workspace) ми вказуємо
 * Vite читати TS-джерело пакетів напряму. Транзитивні рантайм-залежності
 * (tonal, tone, zod, ts-fsrs) встановлені тут, в apps/web.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@melos/ui/theme.css": resolve(__dirname, "../../packages/ui/src/theme.css"),
      "@melos/data": resolve(__dirname, "../../packages/data/src/index.ts"),
      "@melos/core-theory": resolve(__dirname, "../../packages/core-theory/src/index.ts"),
      "@melos/core-analysis": resolve(__dirname, "../../packages/core-analysis/src/index.ts"),
      "@melos/core-pedagogy": resolve(__dirname, "../../packages/core-pedagogy/src/index.ts"),
      "@melos/motif": resolve(__dirname, "../../packages/motif/src/index.ts"),
      "@melos/harmony": resolve(__dirname, "../../packages/harmony/src/index.ts"),
      "@melos/variation": resolve(__dirname, "../../packages/variation/src/index.ts"),
      "@melos/groove-lab/styles.css": resolve(__dirname, "../../packages/groove-lab/src/styles.scoped.css"),
      "@melos/groove-lab": resolve(__dirname, "../../packages/groove-lab/src/index.ts"),
      "@melos/groove-bass": resolve(__dirname, "../../packages/groove-bass/src/index.ts"),
      "@melos/audio": resolve(__dirname, "../../packages/audio/src/index.ts"),
      "@melos/srs": resolve(__dirname, "../../packages/srs/src/index.ts"),
      "@melos/ui": resolve(__dirname, "../../packages/ui/src/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
