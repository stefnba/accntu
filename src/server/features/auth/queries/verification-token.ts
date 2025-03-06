import { db } from '@/server/db';
import {
    InsertVerificationTokenSchema,
    SelectVerificationTokenSchema,
    TOptType,
    verificationToken,
} from '@/server/db/schemas/auth';
import { withDbQuery } from '@/server/lib/handler';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Create a verification token record
 * @param params - The token parameters
 * @param params.userId - The ID of the user (optional for email verification)
 * @param params.email - The email address (for email verification)
 * @param params.type - The type of token
 * @param params.tokenHash - Hash of the token (for OTP verification)
 * @param params.expiresAt - The expiration date of the token
 * @returns The created verification token
 */
export const createVerificationTokenRecord = async (
    inputData: z.infer<typeof InsertVerificationTokenSchema>
) =>
    withDbQuery({
        operation: 'create verification token record',
        inputSchema: InsertVerificationTokenSchema,
        inputData,
        queryFn: (validatedData) =>
            db
                .insert(verificationToken)
                .values({
                    ...validatedData,
                    token: createId(),
                })
                .returning()
                .then(([result]) => result),
    });

/**
 * Get a verification token record by user ID, token, and type
 * @param params - The query parameters
 * @param params.userId - The ID of the user
 * @param params.token - The token to search for
 * @param params.type - The type of token to search for
 * @returns The verification token if found, otherwise null
 */
export const getVerificationTokenRecord = async ({
    userId,
    token,
    type,
}: {
    userId: string;
    token: string;
    type: TOptType;
}) =>
    withDbQuery({
        operation: 'get verification token record',
        outputSchema: SelectVerificationTokenSchema,
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(verificationToken)
                .where(
                    and(
                        eq(verificationToken.userId, userId),
                        eq(verificationToken.token, token),
                        eq(verificationToken.type, type)
                    )
                );
            return result;
        },
    });

/**
 * Mark a verification token as used
 * @param params - The update parameters
 * @param params.token - The token to mark as used
 * @returns The update result
 */
export const markVerificationTokenRecordAsUsed = async ({ token }: { token: string }) =>
    withDbQuery({
        operation: 'mark verification token as used',
        queryFn: () =>
            db
                .update(verificationToken)
                .set({ usedAt: new Date() })
                .where(eq(verificationToken.token, token)),
    });

/**
 * Get a verification token record by token
 * @param params - The query parameters
 * @param params.token - The token to search for
 * @returns The verification token if found, otherwise null
 */
export const getVerificationTokenRecordByToken = async ({ token }: { token: string }) =>
    withDbQuery({
        operation: 'get verification token record by token',
        outputSchema: SelectVerificationTokenSchema,
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(verificationToken)
                .where(eq(verificationToken.token, token));
            return result;
        },
    });

/**
 * Increment the attempts counter for a verification token
 * @param params - The update parameters
 * @param params.token - The token to increment attempts for
 * @returns The update result
 */
export const incrementVerificationTokenRecordAttempts = async ({ token }: { token: string }) =>
    withDbQuery({
        operation: 'increment verification token attempts',
        queryFn: () =>
            db
                .update(verificationToken)
                .set({
                    attempts: sql`${verificationToken.attempts} + 1`,
                })
                .where(eq(verificationToken.token, token)),
    });

/**
 * Delete expired verification tokens
 * @returns The delete result
 */
export const deleteExpiredVerificationTokenRecords = async () =>
    withDbQuery({
        operation: 'delete expired verification tokens',
        queryFn: () =>
            db.delete(verificationToken).where(sql`${verificationToken.expiresAt} < NOW()`),
    });

/**
 * Get verification token records by email and type
 * @param params - The query parameters
 * @param params.email - The email to search for
 * @param params.type - The type of token to search for
 * @returns The verification tokens if found, otherwise empty array
 */
export const getVerificationTokenRecordsByEmailAndType = async ({
    email,
    type,
}: {
    email: string;
    type: TOptType;
}) =>
    withDbQuery({
        operation: 'get verification token records by email and type',
        outputSchema: SelectVerificationTokenSchema.array(),
        queryFn: async () => {
            return db
                .select()
                .from(verificationToken)
                .where(and(eq(verificationToken.email, email), eq(verificationToken.type, type)));
        },
    });
