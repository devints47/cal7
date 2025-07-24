import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const external = ['react', 'react-dom', 'next', 'next/server'];

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
    exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
  }),
  postcss({
    extract: 'styles.css',
    minimize: true,
    sourceMap: true,
    use: ['sass'],
  }),
];

const productionPlugins = process.env.NODE_ENV === 'production' ? [terser()] : [];

export default [
  // ESM build
  {
    input: {
      index: 'src/index.ts',
      route: 'src/route.ts',
    },
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
      chunkFileNames: '[name]-[hash].esm.js',
      sourcemap: true,
      preserveModules: false,
    },
    external,
    plugins: [...plugins, ...productionPlugins],
  },
  // CJS build
  {
    input: {
      index: 'src/index.ts',
      route: 'src/route.ts',
    },
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].js',
      chunkFileNames: '[name]-[hash].js',
      sourcemap: true,
      preserveModules: false,
      exports: 'named',
    },
    external,
    plugins: [...plugins, ...productionPlugins],
  },
];