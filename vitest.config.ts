import { configDefaults, defineConfig } from 'vitest/config'

const testExclusions = [
  'node_modules',
  'config',
  '__mocks__',
  '.eslintrc.json',
  '**/*.styles.ts',
  '**/*.types.ts',
  '**/types.ts',
  '**/index.{ts,tsx}',
  '**/*.d.ts',
]

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'json-summary', 'html'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      exclude: testExclusions,
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, ...testExclusions],
  },
})
