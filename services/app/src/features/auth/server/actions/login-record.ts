import { createLoginAttemptCookie } from '@/features/auth/server/cookies/login-record';
import { logger } from '@/server/lib/logging/logger';
import { db } from '@db';
import { InsertLoginSchema, login, user } from '@db/schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { Context } from 'hono';
import { z } from 'zod';

const RecordLoginAttemptSchema = InsertLoginSchema.pick({
    identifier: true,
    method: true
});

/**
 * Handles creation of a login record when a user tries to log in as welll as setting a cookie to track the login attempt.
 * @param c Honos context.
 */
export const recordLoginAttempt = async (
    c: Context,
    values: z.infer<typeof RecordLoginAttemptSchema>,
    immediateSuccess = false
) => {
    const userAgent = c.req.header('User-Agent');

    const { token } = await createLoginRecord(
        { ...values, userAgent },
        immediateSuccess
    );

    await createLoginAttemptCookie(c, token);
};

/**
 * Create a login record in the database. It also checks if the user exists and assigns the userId if it does.
 */
export const createLoginRecord = async (
    values: z.infer<typeof InsertLoginSchema>,
    immediateSuccess = false
) => {
    const token = crypto.randomBytes(128).toString('base64url');

    let { userId, identifier } = values;

    // If the userId is not provided, use the identifier to look up the user and assign it to userId if the user exists.
    if (!userId && identifier) {
        const user = await db.query.user.findFirst({
            where: (fields, { eq }) => eq(fields.email, identifier)
        });
        if (user) {
            userId = user.id;
        }
    }

    await db.insert(login).values({
        ...values,
        id: token,
        userId,
        successAt: immediateSuccess ? new Date() : null
    });

    if (immediateSuccess) {
        logger.info('Login success', {
            userId: values.userId
        });
    }

    return { token };
};

interface IMakeLoginAttemptSuccessParams {
    id?: string;
    userId: string;
}

/**
 * Update the login and user record when a user successfully logs in.
 * @param id The login record ID.
 * @param userId The user ID.
 */
export const makeLoginAttemptSuccess = async ({
    id,
    userId
}: IMakeLoginAttemptSuccessParams): Promise<void> => {
    if (!id || !userId) return;

    logger.info('Login success', {
        userId
    });

    // update the user's last login time and reset the login attempts.
    await db
        .update(user)
        .set({ lastLoginAt: new Date(), loginAttempts: 0 })
        .where(eq(user.id, userId));

    // update the login record with the success time and the user ID.
    await db
        .update(login)
        .set({ successAt: new Date(), userId })
        .where(eq(login.id, id));
};
