import { betterAuth, BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, customSession, emailOTP, openAPI } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

import { SESSION_COOKIE, SESSION_DATA } from '@/lib/auth/constants';
import { emailService } from '@/server/lib/email';

// relative import required because of better-auth bug
import { db } from '../../server/db';

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
        onError: (error, ctx) => {
            // Custom error handling
            console.error('Auth error:', ctx.baseURL, error);
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
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    account: {
        modelName: 'authAccount',
    },
    plugins: [
        admin(),
        openAPI(),
        passkey({
            rpID: 'localhost:3000',
            rpName: 'Test Passkey',
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
            async sendVerificationOTP({ email, type, otp }, ctx) {
                try {
                    const user = { 
                        email, 
                        name: email.split('@')[0] // fallback to email prefix if name not available
                    };

                    // Use the new decentralized template system
                    const result = await emailService.sendEmail('auth.otp', {
                        to: { email: user.email, name: user.name },
                        data: {
                            user,
                            otpCode: otp,
                            expirationMinutes: 10,
                        },
                        tags: {
                            type: 'authentication',
                            flow: type, // 'sign-in', 'email-verification', etc.
                        },
                    });

                    if (!result.success) {
                        console.error('Failed to send OTP email:', result.error);
                        throw new APIError({
                            code: 'EMAIL_SEND_FAILED',
                            message: 'Failed to send verification email',
                            status: 500,
                        });
                    }

                    console.log(`OTP email sent successfully via ${emailService.getProviderName()}:`, {
                        email,
                        type,
                        templateId: 'auth.otp',
                        messageId: result.id,
                    });
                } catch (error) {
                    console.error('Error sending OTP email:', error);
                    
                    if (error instanceof APIError) {
                        throw error;
                    }
                    
                    throw new APIError({
                        code: 'EMAIL_SEND_FAILED',
                        message: 'Failed to send verification email',
                        status: 500,
                    });
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
            console.log('custom session called');

            // remove ban-related fields
            const { banReason, banExpires, banned, ...restUser } = user;

            return {
                user: {
                    ...restUser,
                },
                session,
            };
        }, options),
    ],
});
