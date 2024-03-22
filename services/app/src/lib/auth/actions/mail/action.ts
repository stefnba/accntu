'use server';

import { cookies } from 'next/headers';

import { userActions } from '@/actions';
import db from '@/db';
import { createMutation } from '@/lib/mutation';
import crypto from 'crypto';
import { TimeSpan, createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';

import { createSession } from '../..';
import { recordLoginAttempt, updateLoginAttempt } from '../login-record';
import { LOGIN_COOKIE_NAME } from '../login-record/config';
import {
    CODE_EXPIRATION,
    CODE_LENGTH,
    EMAIL_COOKIE_NAME,
    REDIRECT_URL,
    VERIFY_COOKIE_NAME
} from './config';
import { SendTokenSchema, VerifyTokenSchema } from './schema';
import type { TSendTokenReturn, TVerifyTokenReturn } from './types';

function generateVerificationCode(): string {
    return generateRandomString(CODE_LENGTH, alphabet('0-9'));
}

/**
 * Send a verification code to the user's email.
 */
export const sendToken = createMutation(
    async (data): Promise<TSendTokenReturn> => {
        // delete all existing tokens for this email
        try {
            await db.verificationCode.deleteMany({
                where: {
                    identifier: data.email
                }
            });

            // check if user exists
            const user = await db.user.findFirst({
                where: {
                    email: data.email
                }
            });
            // record login attempt if user exists
            if (user) {
                await recordLoginAttempt({
                    method: 'EMAIL',
                    userId: user.id
                });
            }

            const code = generateVerificationCode();
            const token = crypto.randomBytes(128).toString('base64url');

            // generate token in db
            await db.verificationCode.create({
                data: {
                    identifier: data.email,
                    code,
                    token,
                    expiresAt: createDate(new TimeSpan(CODE_EXPIRATION, 'm'))
                }
            });

            console.log({ code });

            cookies().set(VERIFY_COOKIE_NAME, token, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 60 * CODE_EXPIRATION,
                sameSite: 'lax'
            });
            cookies().set(EMAIL_COOKIE_NAME, data.email, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 60 * CODE_EXPIRATION,
                sameSite: 'lax'
            });

            // todo send email

            return {
                success: true,
                redirectUrl: REDIRECT_URL
            };
        } catch (error: any) {
            console.error('Error logging in with email', error);
            throw new Error(
                'An error occurred while logging in. Please try again.'
            );
        }
    },
    SendTokenSchema,
    { auth: 'public' }
);

/**
 * Verify the user's email with the given code.
 */
export const verifyToken = createMutation(
    async ({ code }): Promise<TVerifyTokenReturn> => {
        try {
            const token = cookies().get(VERIFY_COOKIE_NAME)?.value ?? null; //verifcation token
            const email = cookies().get(EMAIL_COOKIE_NAME)?.value ?? null;
            const loginToken = cookies().get(LOGIN_COOKIE_NAME)?.value ?? null;
            cookies().delete(VERIFY_COOKIE_NAME);
            cookies().delete(LOGIN_COOKIE_NAME);
            cookies().delete(EMAIL_COOKIE_NAME);

            const codeDb = await db.verificationCode.findFirst({
                where: {
                    code,
                    token: token || '',
                    expiresAt: {
                        gte: new Date()
                    }
                }
            });

            // if codeDb is not null, then the code is valid
            // if token or email cookie is missing, then attempt not valid
            if (!codeDb || !token || !email) {
                throw new Error('Invalid code');
            }

            // code is now validated going forward

            // invalidate code for given identifier
            await db.verificationCode.deleteMany({
                where: {
                    identifier: codeDb.identifier
                }
            });

            // update login attempt
            if (loginToken) {
                await updateLoginAttempt(loginToken);
            }

            // create session
            const existingUser = await db.user.findFirst({
                where: {
                    email
                }
            });

            // user already exists
            if (existingUser) {
                await createSession(existingUser.id);
                return {
                    success: true,
                    redirectUrl: '/'
                };
            }

            // create new user
            const user = await userActions.create({ email });
            await createSession(user.id);

            return {
                success: true,
                redirectUrl: '/'
            };
        } catch (error: any) {
            console.error('Error logging in with email', error);
            throw new Error(
                'An error occurred while logging in. Please try again.'
            );
        }
    },
    VerifyTokenSchema,
    { auth: 'public' }
);
