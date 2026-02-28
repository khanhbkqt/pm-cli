import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'node18',
    clean: true,
    shims: true,
    external: ['better-sqlite3', 'express'],
    banner: {
        js: '#!/usr/bin/env node',
    },
});
