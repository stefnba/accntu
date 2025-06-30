import { beforeAll, beforeEach, vi } from 'vitest';

// Verify we're in test environment
beforeAll(() => {
    if (process.env.NODE_ENV !== 'test') {
        console.warn('Tests are not running in test environment! NODE_ENV =', process.env.NODE_ENV);
    }
});

// Suppress all console methods during tests
beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
});
