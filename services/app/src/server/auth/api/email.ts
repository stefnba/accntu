import { SendOTPSchema, VerifyOTPSchema } from '@/features/auth/schema/otp';
import { requestEmailOTP, verifyEmailOTP } from '@auth/actions/email-otp';
import { createSession } from '@auth/authenticate';
import { EMAIL_OTP_LOGIN, LOGIN_ATTEMPT_COOKIE_NAME } from '@auth/config';
import { AuthError } from '@auth/error';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

import { recordLoginAttempt } from '../actions/login-record';

const app = new Hono()
    .post('/request', zValidator('json', SendOTPSchema), async (c) => {
        const { email } = c.req.valid('json');

        const { success, token, userId } = await requestEmailOTP(email);

        // record login attempt if user exists
        if (userId) {
            const { token: loginAttemptToken } = await recordLoginAttempt({
                method: 'EMAIL',
                userId
            });
            setCookie(c, LOGIN_ATTEMPT_COOKIE_NAME, loginAttemptToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'Lax'
            });
        }

        if (!success) {
            return c.json(
                {
                    error: 'Failed to send verification email'
                },
                400
            );
        }

        // set cookie to track email verification
        setCookie(c, EMAIL_OTP_LOGIN.COOKIE_NAME, token, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60 * EMAIL_OTP_LOGIN.EXPIRATION,
            sameSite: 'Lax'
        });

        return c.json({ success: true }, 201);
    })
    .post('/verify', zValidator('json', VerifyOTPSchema), async (c) => {
        const { code } = c.req.valid('json');

        const verificationToken = getCookie(c, EMAIL_OTP_LOGIN.COOKIE_NAME); //verifcation token
        const loginAttemptToken = getCookie(c, LOGIN_ATTEMPT_COOKIE_NAME); // login token for tracking login attempts
        deleteCookie(c, EMAIL_OTP_LOGIN.COOKIE_NAME);
        deleteCookie(c, LOGIN_ATTEMPT_COOKIE_NAME);

        try {
            const { success, userId } = await verifyEmailOTP({
                code,
                verificationToken,
                loginAttemptToken
            });

            if (!success) {
                throw new AuthError(
                    'Failed to login with email OTP. Please try again.'
                );
            }

            // create session if verification was successful
            await createSession(c, userId);
            return c.json(
                {
                    success: true
                },
                201
            );
        } catch (error: any) {
            if (error instanceof AuthError) {
                return c.json(
                    {
                        error: error.message
                    },
                    401
                );
            }
            throw error;
        }
    });

export default app;
