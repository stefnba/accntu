import { db } from '@/server/db';
import {
    OptType,
    SelectVerificationTokenSchema,
    verificationToken,
} from '@/server/db/schemas/auth';
import { withDbQuery, withDbQueryValidatedNullable } from '@/server/lib/handler';
import { and, eq, sql } from 'drizzle-orm';

/**
 * Create a verification token record
 * @param token - The token to create
 * @param userId - The ID of the user
 * @param type - The type of token to create
 * @param expiresAt - The expiration date of the token
 * @param tokenHash - Optional hash of the token (required by schema)
 */
export const createVerificationTokenRecord = async (
    token: string,
    userId: string,
    type: OptType,
    expiresAt: Date,
    tokenHash: string = token // Default to token if not provided
) =>
    withDbQuery({
        operation: 'create verification token record',
        queryFn: () =>
            db.insert(verificationToken).values({
                token,
                userId,
                type,
                expiresAt,
                tokenHash,
            }),
    });

/**
 * Get a verification token record by user ID, token, and type
 * @param userId - The ID of the user
 * @param token - The token to search for
 * @param type - The type of token to search for
 * @returns The verification token if found, otherwise null
 */
export const getVerificationTokenRecord = async (userId: string, token: string, type: OptType) =>
    withDbQueryValidatedNullable({
        operation: 'get verification token record',
        outputSchema: SelectVerificationTokenSchema,
        queryFn: async () => {
            const tokens = await db
                .select()
                .from(verificationToken)
                .where(
                    and(
                        eq(verificationToken.userId, userId),
                        eq(verificationToken.token, token),
                        eq(verificationToken.type, type)
                    )
                )
                .limit(1);
            return tokens[0];
        },
    });

/**
 * Mark a verification token record as used
 * @param token - The token to mark as used
 */
export const markVerificationTokenRecordAsUsed = async (token: string) =>
    withDbQuery({
        operation: 'mark verification token record as used',
        queryFn: () =>
            db
                .update(verificationToken)
                .set({ usedAt: new Date() })
                .where(eq(verificationToken.token, token)),
    });

/**
 * Create an email verification token record
 * @param token - Secure random token
 * @param email - User's email
 * @param otpHash - Hashed OTP code
 * @param type - Token type
 * @param expiresAt - Expiration date
 */
export const createEmailVerificationTokenRecord = async (
    token: string,
    email: string,
    otpHash: string,
    type: OptType,
    expiresAt: Date
) =>
    withDbQuery({
        operation: 'create email verification token record',
        queryFn: () =>
            db.insert(verificationToken).values({
                token,
                email,
                tokenHash: otpHash,
                type,
                expiresAt,
            }),
    });

/**
 * Get a verification token record by token string
 * @param token - The token string
 */
export const getVerificationTokenRecordByToken = async (token: string) =>
    withDbQueryValidatedNullable({
        operation: 'get verification token record by token',
        outputSchema: SelectVerificationTokenSchema,
        queryFn: async () => {
            const result = await db
                .select()
                .from(verificationToken)
                .where(eq(verificationToken.token, token))
                .limit(1);
            return result[0];
        },
    });

/**
 * Increment verification token record attempts counter
 * @param token - The token
 */
export const incrementVerificationTokenRecordAttempts = async (token: string) =>
    withDbQuery({
        operation: 'increment verification token record attempts',
        queryFn: () =>
            db
                .update(verificationToken)
                .set({
                    attempts: sql`${verificationToken.attempts} + 1`,
                })
                .where(eq(verificationToken.token, token)),
    });

/**
 * Delete expired verification token records
 * @remarks This should be run periodically to clean up the database
 * @todo Implement a scheduled job to clean up expired tokens
 */
export const deleteExpiredVerificationTokenRecords = async () =>
    withDbQuery({
        operation: 'delete expired verification token records',
        queryFn: () =>
            db
                .delete(verificationToken)
                .where(
                    and(
                        sql`${verificationToken.usedAt} IS NOT NULL`,
                        sql`${verificationToken.expiresAt} < ${new Date()}`
                    )
                ),
    });
