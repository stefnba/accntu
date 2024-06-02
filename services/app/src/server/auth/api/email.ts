import { SendOTPSchema, VerifyOTPSchema } from '@/features/auth/schema/otp';
import { requestEmailOTP, verifyEmailOTP } from '@auth/actions/email-otp';
import { recordLoginAttempt } from '@auth/actions/login-record';
import { createSession } from '@auth/authenticate';
import {
    createEmailOtpCookie,
    getEmailOtpCookie
} from '@auth/cookies/email-otp';
import {
    createLoginAttemptCookie,
    getLoginAttemptCookie
} from '@auth/cookies/login-record';
import { AuthError } from '@auth/error';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono()
    .post('/request', zValidator('json', SendOTPSchema), async (c) => {
        const { email } = c.req.valid('json');

        // action to send email OTP
        const { success, token, userId } = await requestEmailOTP(email);

        // record login attempt if user exists
        if (userId) {
            const { token: loginAttemptToken } = await recordLoginAttempt({
                method: 'EMAIL',
                userId
            });
            await createLoginAttemptCookie(c, loginAttemptToken);
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
        await createEmailOtpCookie(c, token);

        return c.json({ success: true }, 201);
    })
    .post('/verify', zValidator('json', VerifyOTPSchema), async (c) => {
        const { code } = c.req.valid('json');

        const verificationToken = await getEmailOtpCookie(c, true);
        const loginAttemptToken = await getLoginAttemptCookie(c, true);

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
