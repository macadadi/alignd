import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test-utils/setup.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/main.ts',
          'src/types/**',
          'src/router/**',
          'src/test-utils/**',
          'src/services/api/client.ts',
          'src/services/api/index.ts',
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
