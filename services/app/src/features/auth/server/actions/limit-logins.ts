import { db } from '@db';
import { SelectUserSchema, user } from '@db/schema';
import { MAX_FAILED_LOGIN_ATTEMPTS } from '@features/auth/server/config';
import { AuthError } from '@features/auth/server/error';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Check if the user has exceeded the maximum number of failed login attempts.
 * @param userRecord The user record to check.
 */
export const checkInvalidLoginAttempts = async (
    userRecord?: z.infer<typeof SelectUserSchema>
) => {
    if (!userRecord) return;

    const { loginAttempts } = userRecord;

    if (loginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        // block user
        await db
            .update(user)
            .set({ isEnabled: false })
            .where(eq(user.id, userRecord.id));

        throw new AuthError({
            message: 'Invalid code',
            internalMessage: 'Exceeded maximum login attempts with invalid'
        });
    }

    // update login attempts
    await db
        .update(user)
        .set({
            loginAttempts: loginAttempts + 1
        })
        .where(eq(user.id, userRecord.id));
};
