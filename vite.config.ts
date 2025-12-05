import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const alias: Record<string, string> = {}
  if (mode === 'development' || mode === 'test') {
    alias['jotai-family'] = path.resolve(__dirname, 'src')
    const localJotai = path.resolve(__dirname, 'jotai/src')
    const hasLocalJotai = fs.existsSync(localJotai)
    if (hasLocalJotai) {
      alias['jotai'] = localJotai
    }
  }

  return {
    resolve: { alias },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'jotaiFamily',
        formats: ['es', 'cjs'],
        fileName: (f) => (f === 'es' ? 'index.mjs' : 'index.cjs'),
      },
      rollupOptions: {
        external: [
          'jotai',
          'jotai/vanilla',
          'jotai/vanilla/utils',
          'jotai/vanilla/internals',
          'jotai/utils',
        ],
      },
      sourcemap: true,
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['tests/**/*.test.{ts,tsx}'],
      exclude: ['jotai/**'],
      env: {
        FORCE_COLOR: '1',
      },
    },
  }
})
