import { db } from '@/server/db';
import {
    OptType,
    SelectVerificationTokenSchema,
    verificationToken,
} from '@/server/db/schemas/auth';
import { withDbQuery, withDbQueryValidatedNullable } from '@/server/lib/handler';
import { and, eq, sql } from 'drizzle-orm';

/**
 * Create an email OTP verification token record
 * @param params - The token parameters
 * @param params.token - Secure random token
 * @param params.email - User's email
 * @param params.otpHash - Hashed OTP code
 * @param params.expiresAt - Expiration date
 */
export const createEmailOtpRecord = async ({
    token,
    email,
    otpHash,
    expiresAt,
}: {
    token: string;
    email: string;
    otpHash: string;
    expiresAt: Date;
}) =>
    withDbQuery({
        operation: 'create email OTP record',
        queryFn: () =>
            db.insert(verificationToken).values({
                token,
                email,
                tokenHash: otpHash,
                type: 'login' as OptType,
                expiresAt,
            }),
    });

/**
 * Get an email OTP verification token record by token
 * @param params - The query parameters
 * @param params.token - The token string
 */
export const getEmailOtpRecordByToken = async ({ token }: { token: string }) =>
    withDbQueryValidatedNullable({
        operation: 'get email OTP record by token',
        outputSchema: SelectVerificationTokenSchema,
        queryFn: async () => {
            const result = await db
                .select()
                .from(verificationToken)
                .where(and(eq(verificationToken.token, token), eq(verificationToken.type, 'login')))
                .limit(1);
            return result[0];
        },
    });

/**
 * Get an email OTP verification token record by email
 * @param params - The query parameters
 * @param params.email - The user's email
 */
export const getEmailOtpRecordByEmail = async ({ email }: { email: string }) =>
    withDbQueryValidatedNullable({
        operation: 'get email OTP record by email',
        outputSchema: SelectVerificationTokenSchema,
        queryFn: async () => {
            const result = await db
                .select()
                .from(verificationToken)
                .where(
                    and(
                        eq(verificationToken.email, email),
                        eq(verificationToken.type, 'login'),
                        sql`${verificationToken.usedAt} IS NULL`
                    )
                )
                .orderBy(sql`${verificationToken.createdAt} DESC`)
                .limit(1);
            return result[0];
        },
    });

/**
 * Mark an email OTP verification token as used
 * @param params - The update parameters
 * @param params.token - The token string
 */
export const markEmailOtpRecordAsUsed = async ({ token }: { token: string }) =>
    withDbQuery({
        operation: 'mark email OTP record as used',
        queryFn: () =>
            db
                .update(verificationToken)
                .set({ usedAt: new Date() })
                .where(
                    and(eq(verificationToken.token, token), eq(verificationToken.type, 'login'))
                ),
    });

/**
 * Increment the number of attempts for an email OTP verification token
 * @param params - The update parameters
 * @param params.token - The token string
 */
export const incrementEmailOtpRecordAttempts = async ({ token }: { token: string }) =>
    withDbQuery({
        operation: 'increment email OTP record attempts',
        queryFn: () =>
            db
                .update(verificationToken)
                .set({ attempts: sql`${verificationToken.attempts} + 1` })
                .where(
                    and(eq(verificationToken.token, token), eq(verificationToken.type, 'login'))
                ),
    });
