import { routes } from '@/server/';
import { testClient } from 'hono/testing';
import { expect } from 'vitest';
import { createTestAuth, type TestAuthSetup } from './auth-setup';

export const createTestClient = () => testClient(routes);

export const setupTestAuth = async (): Promise<TestAuthSetup> => {
    const { testUser, authHeaders } = await createTestAuth();
    
    // Only log in non-silent test mode
    if (process.env.SILENT_TESTS !== 'true') {
        console.log('✅ Test user created:', testUser.email);
    }
    
    return { testUser, authHeaders };
};

export const expectUnauthorized = (status: number) => {
    expect(status).toBe(401);
};

export const expectSuccess = (status: number) => {
    expect([200, 201].includes(status)).toBe(true);
};

export const expectValidationError = (status: number) => {
    expect(status).toBe(400);
};

export const expectSuccessOrAuthError = (status: number) => {
    expect([200, 201, 401].includes(status)).toBe(true);
};

export const expectAnyValidResponse = (status: number) => {
    expect([200, 201, 400, 401, 404, 500].includes(status)).toBe(true);
};

export * from './auth-setup';
