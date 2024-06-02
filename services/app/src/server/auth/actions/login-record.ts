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
export const recordLoginAttempt = async ({
    userId,
    method
}: IRecordLoginAttemptParams) => {
    const token = crypto.randomBytes(128).toString('base64url');

    await db.insert(login).values({
        id: token,
        userId,
        method
    });

    return { token };
};

/**
 * Update the login record when a user successfully logs in.
 */
export const makeLoginAttemptSuccess = async (
    id?: string,
    userId?: string
): Promise<void> => {
    if (!id || !userId) return;

    logger.info('Login success', {
        userId
    });

    await db
        .update(login)
        .set({ successAt: new Date() })
        .where(eq(login.id, id));
};
