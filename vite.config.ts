import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**/*'],
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
      // Externalize ALL dependencies except the few we want to bundle
      external: (id) => {
        // Bundle only these 3 runtime dependencies
        const bundledDeps = ['dompurify', 'focus-trap', 'zod'];
        
        // External: React ecosystem
        if (['react', 'react-dom', 'react/jsx-runtime', 'next'].some(dep => id.startsWith(dep))) {
          return true;
        }
        
        // External: Node.js built-ins
        if (['fs', 'path', 'url', 'http', 'https', 'crypto', 'stream', 'util', 'events', 'os', 'assert', 'buffer', 'string_decoder', 'zlib', 'tls', 'net', 'child_process', 'vm'].includes(id)) {
          return true;
        }
        
        // External: Dev/test dependencies (should never be imported, but safety check)
        if (['jsdom', 'vitest', '@testing-library', 'jest', 'axe-core'].some(dep => id.includes(dep))) {
          return true;
        }
        
        // External: CSS/build tools
        if (['@csstools', 'autoprefixer', 'postcss', 'vite', 'esbuild'].some(dep => id.includes(dep))) {
          return true;
        }
        
        // Bundle our 3 runtime deps
        if (bundledDeps.some(dep => id === dep || id.startsWith(dep + '/'))) {
          return false;
        }
        
        // External: Everything else from node_modules
        if (id.includes('node_modules') || (!id.startsWith('.') && !id.startsWith('/'))) {
          return true;
        }
        
        return false;
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          next: 'Next'
        }
      },
      onwarn(warning, warn) {
        // Suppress "use client" warnings for library builds
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        // Suppress external module warnings
        if (warning.code === 'UNRESOLVED_IMPORT') {
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