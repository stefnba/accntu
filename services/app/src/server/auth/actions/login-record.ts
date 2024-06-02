import { logger } from '@/server/lib/logging/logger';
import { db } from '@db';
import { LoginMethodSchema, login } from '@db/schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

interface IRecordLoginAttemptParams {
    userId?: string;
    email?: string;
    method: z.infer<typeof LoginMethodSchema>;
}

/**
 * Add a new record to the login table when a user tries to log in.
 */
export const recordLoginAttempt = async (
    { userId, method }: IRecordLoginAttemptParams,
    immediateSuccess = false
) => {
    const token = crypto.randomBytes(128).toString('base64url');

    await db.insert(login).values({
        id: token,
        userId,
        method,
        successAt: immediateSuccess ? new Date() : null
    });

    if (immediateSuccess) {
        logger.info('Login success', {
            userId
        });
    }

    return { token };
};

interface IMakeLoginAttemptSuccessParams {
    id?: string;
    userId: string;
}

/**
 * Update the login record when a user successfully logs in.
 */
export const makeLoginAttemptSuccess = async ({
    id,
    userId
}: IMakeLoginAttemptSuccessParams): Promise<void> => {
    if (!id) return;

    logger.info('Login success', {
        userId
    });

    await db
        .update(login)
        .set({ successAt: new Date() })
        .where(eq(login.id, id));
};
