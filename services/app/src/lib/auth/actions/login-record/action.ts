import { cookies, headers } from 'next/headers';

import { db, schema as dbSchema } from '@/db';
import { LoginMethod } from '@prisma/client';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

import { LOGIN_COOKIE_NAME } from './config';

interface IRecordLoginAttemptParams {
    userId?: string;
    email?: string;
    method: LoginMethod;
}

/**
 * Add a new record to the login table when a user tries to log in.
 */
export const recordLoginAttempt = async ({
    userId,
    method
}: IRecordLoginAttemptParams): Promise<string> => {
    const token = crypto.randomBytes(128).toString('base64url');

    const headersList = headers();

    await db.insert(dbSchema.login).values({
        id: token,
        userId,
        method
    });

    cookies().set(LOGIN_COOKIE_NAME, token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    });

    return token;
};

/**
 * Update the login record when a user successfully logs in.
 */
export const updateLoginAttempt = async (id: string): Promise<void> => {
    await db
        .update(dbSchema.login)
        .set({ successAt: new Date() })
        .where(eq(dbSchema.login.id, id));
};
