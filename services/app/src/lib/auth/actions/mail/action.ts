'use server';

import { cookies } from 'next/headers';

import { userActions } from '@/actions';
import { db, schema as dbSchema } from '@/db';
import { createMutation } from '@/lib/actions';
import { logger } from '@/logger';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { TimeSpan, createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';

import { createSession } from '../..';
import { recordLoginAttempt, updateLoginAttempt } from '../login-record';
import { LOGIN_COOKIE_NAME } from '../login-record/config';
import {
    CODE_EXPIRATION,
    CODE_LENGTH,
    REDIRECT_URL,
    VERIFY_COOKIE_NAME
} from './config';
import { AuthError } from './error';
import { SendTokenSchema, VerifyTokenSchema } from './schema';
import type { TSendTokenReturn, TVerifyTokenReturn } from './types';

function generateVerificationCode(): string {
    return generateRandomString(CODE_LENGTH, alphabet('0-9'));
}

/**
 * Send a verification code to the user's email.
 */
export const sendToken = createMutation(
    async ({ data }): Promise<TSendTokenReturn> => {
        // delete all existing tokens for this email
        try {
            await db
                .delete(dbSchema.verificationToken)
                .where(eq(dbSchema.verificationToken.identifier, data.email));

            // check if user exists
            const user = await db.query.user.findFirst({
                where: (fields, { eq }) => eq(fields.email, data.email)
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
            await db.insert(dbSchema.verificationToken).values({
                identifier: data.email,
                code,
                token,
                expiresAt: createDate(new TimeSpan(CODE_EXPIRATION, 'm'))
            });

            console.log({ code });

            cookies().set(VERIFY_COOKIE_NAME, token, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 60 * CODE_EXPIRATION,
                sameSite: 'lax'
            });

            // todo send email
            // data.email
            logger.info('OTP code sent', { email: data.email });

            return {
                success: true,
                redirectUrl: REDIRECT_URL
            };
        } catch (error: any) {
            logger.error('Error logging in with email', error);
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
    async ({ data: { code } }): Promise<TVerifyTokenReturn> => {
        try {
            const verificationToken =
                cookies().get(VERIFY_COOKIE_NAME)?.value ?? null; //verifcation token
            const loginToken = cookies().get(LOGIN_COOKIE_NAME)?.value ?? null; // login token for tracking login attempts
            cookies().delete(VERIFY_COOKIE_NAME);
            cookies().delete(LOGIN_COOKIE_NAME);

            // we can't proceed without a token
            if (!verificationToken) {
                throw new AuthError({
                    publicMessage: 'Invalid OTP code',
                    message: 'No verification token found'
                });
            }

            const verificationRecord =
                await db.query.verificationToken.findFirst({
                    where: (fields, { eq, and, gte }) =>
                        and(
                            eq(fields.token, verificationToken || ''),
                            gte(fields.expiresAt, new Date())
                        )
                });

            // record not found, e.g. because expired or invalid token
            if (!verificationRecord) {
                throw new AuthError(
                    {
                        publicMessage: 'Invalid OTP code',
                        message:
                            'No verification record found for specified token'
                    },
                    {
                        token: verificationToken
                    }
                );
            }

            // check if code is valid
            if (verificationRecord.code !== code) {
                // check if login attempt is for existing user
                const user = await db.query.user.findFirst({
                    where: (fields, { eq }) =>
                        eq(fields.email, verificationRecord.identifier)
                });
                if (user) {
                    const { loginAttempts } = user;

                    await db
                        .update(dbSchema.user)
                        .set({
                            loginAttempts: loginAttempts + 1
                        })
                        .where(eq(dbSchema.user.id, user.id));

                    if (loginAttempts >= 5) {
                        throw new AuthError('Invalid OTP code');

                        // todo block user
                    }
                }

                throw new AuthError({
                    publicMessage: 'Invalid OTP code',
                    message: 'Invalid OTP code entered'
                });
            }

            // code is now validated going forward

            // invalidate code for given identifier
            await db
                .delete(dbSchema.verificationToken)
                .where(
                    eq(
                        dbSchema.verificationToken.identifier,
                        verificationRecord.identifier
                    )
                );

            // update login attempt to success
            if (loginToken) {
                await updateLoginAttempt(loginToken);
            }

            // get user by email
            const existingUser = await db.query.user.findFirst({
                where: (fields, { eq }) =>
                    eq(fields.email, verificationRecord.identifier)
            });

            // user already exists
            if (existingUser) {
                await createSession(existingUser.id);
                await db
                    .update(dbSchema.user)
                    .set({
                        loginAttempts: 0
                    })
                    .where(eq(dbSchema.user.id, existingUser.id));

                logger.info('Login success', {
                    email: existingUser.email,
                    userId: existingUser.id
                });

                return {
                    success: true,
                    redirectUrl: '/'
                };
            }

            // create new user
            const user = await userActions.create({
                email: verificationRecord.identifier
            });
            await createSession(user.id);

            logger.info('User created as part of email login', {
                email: user.email,
                userId: user.id
            });

            return {
                success: true,
                redirectUrl: '/'
            };
        } catch (error: any) {
            // if (error instanceof AuthError) {
            //     throw new Error(error.publicMessage);
            // }

            logger.error('Error verifying email', { error });
            throw error;
        }
    },
    VerifyTokenSchema,
    { auth: 'public' }
);
