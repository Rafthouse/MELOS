import { defineConfig } from 'vite';

// Прев'ю Groove-Bass Lab. Root = preview/, але дозволяємо імпорт ../src (живий движок).
export default defineConfig({
  root: 'preview',
  server: { fs: { allow: ['..'] } },
  build: { outDir: '../preview-dist', emptyOutDir: true },
});
