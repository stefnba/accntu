import { cookies, headers } from 'next/headers';

import db from '@/db';
import { LoginMethod } from '@prisma/client';
import crypto from 'crypto';

import { LOGIN_COOKIE_NAME } from './config';

interface IRecordLoginAttemptParams {
    userId?: string;
    email?: string;
    method: LoginMethod;
}

export const recordLoginAttempt = async ({
    userId,
    method
}: IRecordLoginAttemptParams): Promise<string> => {
    const token = crypto.randomBytes(128).toString('base64url');

    const headersList = headers();

    console.log(headersList);

    await db.login.create({
        data: {
            id: token,
            userId,
            method
        }
    });

    cookies().set(LOGIN_COOKIE_NAME, token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    });

    return token;
};

export const updateLoginAttempt = async (id: string): Promise<void> => {
    await db.login.update({
        where: {
            id
        },
        data: {
            successAt: new Date()
        }
    });
};
