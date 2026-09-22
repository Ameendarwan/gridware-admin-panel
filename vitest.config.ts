import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

const testExclusions = [
  'dist',
  'node_modules',
  'config',
  'cypress',
  'playwright',
  'tests',
  'vite.config.ts',
  'tailwind.config.ts',
  'vitest.config.ts',
  'eslint.config.cjs',
  'cypress.config.ts',
  '.lintstagedrc.js',
  'src/store/apis',
  'src/store/middleware',
  'src/routes',
  'src/mock',
  '__mocks__',
  '.eslintrc.json',
  '**/*.styles.ts',
  '**/*.types.ts',
  '**/types.ts',
  '**/index.{ts,tsx}',
  '**/*.d.ts',
  '**/TestOverlay*',
  '**/EdgeInspector*',
];

export default defineConfig({
  plugins: [react()],
  envDir: './env',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'json-summary', 'html', ['lcov', { outputFile: 'lcov.info', silent: true }]],
      thresholds: {
        lines: 80,
        branches: 80,
        statements: 80,
      },
      exclude: testExclusions,
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, ...testExclusions],
  },
});
