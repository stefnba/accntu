import { betterAuth, BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, customSession, emailOTP, openAPI } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

import { SESSION_COOKIE, SESSION_DATA } from '@/lib/auth/constants';
import { sendOtpEmail } from '@/lib/auth/email';
import { getEnv } from '@/lib/env';

// relative import required because of better-auth bug
import { db } from '../../server/db';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME } =
    getEnv();

const options = {
    emailAndPassword: {
        enabled: true,
    },
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    onAPIError: {
        throw: true,
        errorURL: '/error',
        onError: (_error, _ctx) => {
            // Custom error handling - log to monitoring service in production
        },
    },
    advanced: {
        cookies: {
            session_token: {
                name: SESSION_COOKIE.NAME,
            },
            session_data: {
                name: SESSION_DATA.NAME,
            },
        },
        cookiePrefix: '',
    },
    verification: {
        modelName: 'authVerification',
    },
    user: {
        // fields: {
        //     name: 'firstName',
        // },
        additionalFields: {
            lastLoginAt: {
                type: 'date',
                required: false,
                returned: true,
                input: false,
            },
            lastName: {
                type: 'string',
                returned: true,
                required: false,
            },
            // language: {
            //     type: 'string',
            //     returned: true,
            //     required: false,
            //     defaultValue: 'en',
            // },
        },
    },
    session: {
        modelName: 'authSession',
        additionalFields: {
            lastActiveAt: {
                type: 'date',
                required: false,
                returned: true,
                input: false,
            },
        },
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes cache duration in seconds
        },
    },
    socialProviders: {
        github: {
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
        },
    },
    account: {
        modelName: 'authAccount',
    },
    plugins: [
        admin(),
        openAPI(),
        passkey({
            rpID: NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, ''),
            rpName: NEXT_PUBLIC_APP_NAME,
            schema: {
                passkey: {
                    modelName: 'authPasskey',
                    fields: {
                        credentialID: 'credentialId',
                    },
                },
            },
        }),
        emailOTP({
            otpLength: 8,
            sendVerificationOnSignUp: true,
            disableSignUp: false,
            async sendVerificationOTP({ email, type, otp }) {
                try {
                    const user = {
                        email,
                        name: email.split('@')[0], // fallback to email prefix if name not available
                    };

                    // Use the new decentralized template system
                    const result = await sendOtpEmail({
                        to: { email: user.email, name: user.name },
                        data: {
                            user,
                            otpCode: otp,
                        },
                        tags: {
                            type: 'authentication',
                            flow: type, // 'sign-in', 'email-verification', etc.
                        },
                    });

                    if (!result.success) {
                        throw new Error('Failed to send OTP email');
                    }
                } catch (error) {
                    if (error instanceof APIError) {
                        throw error;
                    }

                    throw new Error('Failed to send OTP email');
                }
            },
        }),
        nextCookies(),
    ],
} satisfies BetterAuthOptions;

/**
 * Auth config used for better-auth
 */
export const auth = betterAuth({
    ...options,
    plugins: [
        ...(options.plugins ?? []),
        customSession(async ({ user, session }) => {
            // remove ban-related fields
            const { banReason, banExpires, banned, ...restUser } = user; // eslint-disable-line @typescript-eslint/no-unused-vars

            return {
                user: {
                    ...restUser,
                },
                session,
            };
        }, options),
    ],
});
