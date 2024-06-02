import { MAX_FAILED_LOGIN_ATTEMPTS } from '@auth/config';
import { AuthError } from '@auth/error';
import { db } from '@db';
import { SelectUserSchema, user } from '@db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const checkInvalidLoginAttempts = async (
    userRecord?: z.infer<typeof SelectUserSchema>
) => {
    if (!userRecord) return;

    const { loginAttempts } = userRecord;

    if (loginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        throw new AuthError({
            message: 'Invalid code',
            internalMessage: 'Exceeded maximum login attempts with invalid'
        });

        // todo block user
    }

    // update login attempts
    await db
        .update(user)
        .set({
            loginAttempts: loginAttempts + 1
        })
        .where(eq(user.id, user.id));
};
