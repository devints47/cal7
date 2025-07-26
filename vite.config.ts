import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.*', '**/*.spec.*'],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        route: resolve(__dirname, 'src/route.ts')
      },
      name: 'Cal7',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'next'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          next: 'Next'
        }
      },
      onwarn(warning, warn) {
        // Suppress "use client" warnings for library builds
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        // Suppress external module warnings from test dependencies
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.id?.includes('jsdom')) {
          return;
        }
        warn(warning);
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild'
  }
});