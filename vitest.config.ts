import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['src/shared/test-utils/setup.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**', '.trunk/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/main.ts',
          'src/shared/types/**',
          'src/core/router/**',
          'src/shared/test-utils/**',
          'src/services/api/client.ts',
          '**/*.d.ts',
        ],
        thresholds: {
          branches: 88,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  }),
)
