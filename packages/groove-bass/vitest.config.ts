import { defineConfig } from 'vitest/config';

// Окремо від vite.config.ts (той має root:'preview' для прев'ю-апи).
export default defineConfig({
  test: { include: ['test/**/*.test.ts'] },
});
