import { SendOTPSchema, VerifyOTPSchema } from '@/features/auth/schema/otp';
import { requestEmailOTP, verifyEmailOTP } from '@auth/actions/email-otp';
import {
    makeLoginAttemptSuccess,
    recordLoginAttempt
} from '@auth/actions/login-record';
import { createSession } from '@auth/authenticate';
import { EMAIL_OTP_LOGIN } from '@auth/config';
import {
    createEmailOtpCookie,
    deleteEmailOtpCookie,
    getEmailOtpCookie
} from '@auth/cookies/email-otp';
import { getLoginAttemptCookie } from '@auth/cookies/login-record';
import { AuthError } from '@auth/error';
import { db } from '@db';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const { COOKIE_NAME } = EMAIL_OTP_LOGIN;

const app = new Hono()
    .post('/resend', async (c) => {
        const token = await getEmailOtpCookie(c, true);

        console.log('token', token);

        if (!token) {
            console.log('No email OTP token found');
            return c.json(
                {
                    error: 'No email OTP token found'
                },
                400
            );
        }

        const verificationRecord = await db.query.verificationToken.findFirst({
            where: (fields, { and, eq }) => and(eq(fields.token, token))
        });

        if (!verificationRecord) {
            return c.json(
                {
                    error: 'Invalid email OTP token'
                },
                400
            );
        }

        const email = verificationRecord.identifier;

        // action to send email OTP
        const { token: newToken } = await requestEmailOTP(email);

        // set cookie to track email verification
        await createEmailOtpCookie(c, newToken);

        return c.json({ success: true }, 201);
    })
    .post('/request', zValidator('json', SendOTPSchema), async (c) => {
        const { email } = c.req.valid('json');

        // action to send email OTP
        const { token } = await requestEmailOTP(email);

        // record login attempt
        await recordLoginAttempt(c, { identifier: email, method: 'EMAIL_OTP' });

        // set cookie to track email verification
        await createEmailOtpCookie(c, token);

        return c.json({ success: true }, 201);
    })
    .post('/verify', zValidator('json', VerifyOTPSchema), async (c) => {
        const { code } = c.req.valid('json');

        const verificationToken = await getEmailOtpCookie(c, false);
        const loginAttemptToken = await getLoginAttemptCookie(c, true);

        try {
            const { success, userId } = await verifyEmailOTP({
                code,
                verificationToken
            });

            if (!success) {
                throw new AuthError(
                    'Failed to login with email OTP. Please try again.'
                );
            }

            await deleteEmailOtpCookie(c);

            // if verification was successful, mark the login attempt as successful
            await makeLoginAttemptSuccess({ id: loginAttemptToken, userId });

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
