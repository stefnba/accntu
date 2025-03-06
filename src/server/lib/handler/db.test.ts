import { db } from '@/server/db';
import { user, userSettings } from '@/server/db/schemas';
import { createId } from '@paralleldrive/cuid2';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { withDbQuery } from './db';

describe('withDbQuery', () => {
    const testUser = {
        id: createId(),
        email: `test-${createId()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        image: null,
        createdAt: new Date(),
        lastLoginAt: null,
        role: 'user' as const,
    };

    const testUserSettings = {
        userId: testUser.id,
        theme: 'light' as const,
        language: 'en' as const,
        timezone: 'UTC',
        currency: 'USD',
    };

    beforeAll(async () => {
        // Create test user and settings
        await db.insert(user).values(testUser);
        await db.insert(userSettings).values(testUserSettings);
    });

    afterAll(async () => {
        // Clean up test data
        await db.delete(userSettings).where(eq(userSettings.userId, testUser.id));
        await db.delete(user).where(eq(user.id, testUser.id));
    });

    describe('input validation', () => {
        const inputSchema = z.object({
            email: z.string().email(),
        });

        it('should validate input data', async () => {
            const result = await withDbQuery({
                queryFn: (input) =>
                    db
                        .select()
                        .from(user)
                        .where(eq(user.email, input.email))
                        .then((result) => result[0]),
                inputSchema,
                inputData: { email: testUser.email },
            });

            expect(result).toBeDefined();
            expect(result?.email).toBe(testUser.email);
        });

        it('should throw validation error for invalid input', async () => {
            await expect(
                withDbQuery({
                    queryFn: (input) =>
                        db
                            .select()
                            .from(user)
                            .where(eq(user.email, input.email))
                            .then((result) => result[0]),
                    inputSchema,
                    inputData: { email: 'invalid-email' },
                })
            ).rejects.toThrow('Invalid input data');
        });
    });

    describe('output validation', () => {
        const outputSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
        });

        it('should validate output data', async () => {
            const result = await withDbQuery({
                queryFn: () =>
                    db
                        .select({
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        })
                        .from(user)
                        .where(eq(user.id, testUser.id))
                        .then((result) => result[0]),
                outputSchema,
            });

            expect(result).toBeDefined();
            expect(result?.email).toBe(testUser.email);
            expect(result?.id).toBe(testUser.id);
            expect(result?.firstName).toBe(testUser.firstName);
            expect(result?.lastName).toBe(testUser.lastName);
        });

        it('should throw validation error for invalid output', async () => {
            await expect(
                withDbQuery({
                    queryFn: () =>
                        db
                            .select({
                                id: user.id,
                                email: sql`'invalid-email'`, // Invalid email format
                                firstName: user.firstName,
                                lastName: user.lastName,
                            })
                            .from(user)
                            .where(eq(user.id, testUser.id))
                            .then((result) => result[0]),
                    outputSchema,
                    operation: 'database operation',
                })
            ).rejects.toThrow('Invalid output data from database operation');
        });
    });

    describe('null handling', () => {
        it('should return null for non-existent user when allowNull is true', async () => {
            const result = await withDbQuery({
                queryFn: () =>
                    db
                        .select()
                        .from(user)
                        .where(eq(user.email, 'non-existent@example.com'))
                        .then((result) => result[0]),
                allowNull: true,
            });

            expect(result).toBeNull();
        });

        it('should throw error for non-existent user when allowNull is false', async () => {
            await expect(
                withDbQuery({
                    queryFn: () =>
                        db
                            .select()
                            .from(user)
                            .where(eq(user.email, 'non-existent@example.com'))
                            .then((result) => result[0]),
                    allowNull: false,
                })
            ).rejects.toThrow('Database returned null');
        });
    });

    describe('error handling', () => {
        it('should handle database errors', async () => {
            // Simulate a database error by using an invalid table name
            await expect(
                withDbQuery({
                    queryFn: () =>
                        db
                            .select()
                            .from('invalid_table' as any)
                            .where(eq(user.id, testUser.id))
                            .then((result) => result[0]),
                    operation: 'test invalid table',
                })
            ).rejects.toThrow('Database error in test invalid table: syntax error at or near "$1"');
        });

        it('should handle validation errors', async () => {
            const invalidSchema = z.object({
                email: z.string().email(),
            });

            await expect(
                withDbQuery({
                    queryFn: (input) =>
                        db
                            .select()
                            .from(user)
                            .where(eq(user.email, input.email))
                            .then((result) => result[0]),
                    inputSchema: invalidSchema,
                    inputData: { email: 'invalid-email' },
                })
            ).rejects.toThrow('Invalid input data');
        });
    });

    describe('complex queries', () => {
        it('should handle joins and complex selections', async () => {
            const result = await withDbQuery({
                queryFn: () =>
                    db
                        .select({
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            settings: {
                                theme: userSettings.theme,
                                language: userSettings.language,
                            },
                        })
                        .from(user)
                        .innerJoin(userSettings, eq(user.id, userSettings.userId))
                        .where(eq(user.id, testUser.id))
                        .then((result) => result[0]),
            });

            expect(result).toBeDefined();
            expect(result?.email).toBe(testUser.email);
            expect(result?.settings.theme).toBe(testUserSettings.theme);
            expect(result?.settings.language).toBe(testUserSettings.language);
        });
    });
});
