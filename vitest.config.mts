import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Mirror the tsconfig `@/*` -> `./*` path alias (repo root).
const root = fileURLToPath(new URL('.', import.meta.url))
  .replace(/\\/g, '/')
  .replace(/\/$/, '');

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      // `server-only` throws outside an RSC bundle; stub it so server modules
      // (services/*, lib/ai/*) can be exercised in the Node test environment.
      { find: 'server-only', replacement: `${root}/tests/stubs/server-only.ts` },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
