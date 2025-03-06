import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        env: {
            NODE_ENV: 'test',
        },
        setupFiles: ['./test/setup.ts'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
