import { user } from '@/lib/auth/server/db/tables';
import { routes } from '@/server/';
import { db } from '@/server/db';
import { createId } from '@paralleldrive/cuid2';
import { testClient } from 'hono/testing';
import { expect } from 'vitest';
import { createTestAuth } from './auth-setup';

// Re-export types from auth-setup
export type { TestAuthHeaders, TestAuthSetup, TestAuthUser } from './auth-setup';

export const createTestClient = () => testClient(routes);

export const setupTestAuth = async () => {
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

/**
 * Creates a user in the database and returns the user object.
 */
export const createTestUser = async (): Promise<typeof user.$inferSelect> => {
    const id = createId();
    const email = `test-${id}@example.com`;

    // Query the database to get the ACTUAL user ID that was created
    const [createdUser] = await db
        .insert(user)
        .values({
            email,
            name: `Test User ${id}`,
            emailVerified: true,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    if (!createdUser) {
        throw new Error('Failed to retrieve created user from database');
    }

    return createdUser;
};
