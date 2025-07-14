import { userServiceSchemas } from '@/lib/auth/client/schemas/user';
import { auth } from '@/lib/auth/config';
import { protectedServerRoute } from '@/lib/auth/server/validate';
import { clearCookie, setCookie } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';

import { Hono } from 'hono';

const endpoints = auth.api;

const {
    signUpEmail,

    signOut,
    signInEmailOTP,
    signInSocial,
    sendVerificationOTP,
    getVerificationOTP,
    verifyEmailOTP,

    // admin
    banUser,
    // unbanUser,
    // revokeUserSession,
    // removeUser,
    // revokeUserSessions,

    // user
    changeEmail,
    updateUser,

    // sessions
    listSessions,
    revokeOtherSessions,
    revokeSession,
    revokeSessions,

    // passkey
    // deletePasskey,
} = endpoints;

const app = new Hono()
    /**
     * Sign up
     */
    .post(signUpEmail.path, zValidator('json', signUpEmail.options.body), async (c) =>
        withRoute(c, async () => {
            const body = c.req.valid('json');
            const response = await signUpEmail({
                headers: c.req.header(),
                body: {
                    email: body.email,
                    password: body.password,
                    name: body.name,
                },
            });
            return response;
        })
    )
    /**
     * Sign in
     */
    .post(signInEmailOTP.path, zValidator('json', signInEmailOTP.options.body), async (c) => {
        const body = c.req.valid('json');

        const response = await signInEmailOTP({
            body,
        });

        // clear the email cookie
        clearCookie(c, 'AUTH_OTP_EMAIL');

        return c.json(response);
    })
    .post(signInSocial.path, zValidator('json', signInSocial.options.body), async (c) => {
        const body = c.req.valid('json');
        const response = await signInSocial({
            body,
        });
        return c.json(response);
    })

    /**
     * Verification OTP
     */
    .post(
        sendVerificationOTP.path,
        zValidator('json', sendVerificationOTP.options.body),
        async (c) => {
            const body = c.req.valid('json');

            // Set the email in the cookie for the verify-otp page
            if (body.type === 'sign-in') {
                setCookie(c, 'AUTH_OTP_EMAIL', body.email, {
                    maxAge: 60 * 5, // 5 minutes
                });
            }

            const response = await sendVerificationOTP({
                body,
            });
            return c.json(response);
        }
    )

    .post(verifyEmailOTP.path, zValidator('json', verifyEmailOTP.options.body), async (c) => {
        const body = c.req.valid('json');

        try {
            const response = await verifyEmailOTP({
                body,
            });

            return c.json(response);
        } catch (error) {
            console.error('Error verifying email OTP:', error);
            return c.json({ error: 'Failed to verify email OTP' }, 500);
        }
    })

    .get(
        getVerificationOTP.path,
        zValidator('query', getVerificationOTP.options.query),
        async (c) => {
            const query = c.req.valid('query');
            const response = await getVerificationOTP({
                query,
            });
            return c.json(response);
        }
    )

    /**
     * Admin
     */
    .post(banUser.path, zValidator('json', banUser.options.body), async (c) => {
        const body = c.req.valid('json');
        const response = await banUser({
            body,
        });
        return c.json(response);
    })

    /**
     * User management
     */
    .patch(
        '/user/update',
        protectedServerRoute,
        zValidator('json', userServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const { settings, ...rest } = c.req.valid('json');

                const response = await updateUser({
                    body: rest,
                    headers: c.req.header(),
                });

                // todo: update settings
                console.log('settings', settings);

                return response;
            })
    )

    .post('/user/change-email', zValidator('json', changeEmail.options.body), async (c) => {
        const body = c.req.valid('json');
        const response = await changeEmail({
            body,
        });
        return c.json(response);
    })

    /**
     * Session management
     */

    .get('/sessions/get', async (c) =>
        withRoute(c, async () => {
            const session = await endpoints.getSession({
                headers: c.req.raw.headers,
            });

            if (!session) {
                throw errorFactory.createAuthError({
                    code: 'SESSION_TOKEN_NOT_FOUND',
                });
            }

            return session;
        })
    )
    .get('/sessions', async (c) =>
        withRoute(c, async () => {
            const response = await listSessions({
                headers: c.req.header(),
            });
            return response;
        })
    )

    .post('/sessions/revoke-others', async (c) => {
        const response = await revokeOtherSessions({
            headers: c.req.header(),
        });
        return c.json(response);
    })

    .post('/sessions/revoke-all', async (c) => {
        const response = await revokeSessions({
            headers: c.req.header(),
        });
        return c.json(response);
    })

    .post('/sessions/revoke', zValidator('json', revokeSession.options.body), async (c) => {
        const body = c.req.valid('json');
        const response = await revokeSession({
            body,
            headers: c.req.header(),
        });
        return c.json(response);
    })

    /**
     * Sign out
     */
    .post(signOut.path, async (c) => {
        const response = await signOut({
            headers: c.req.header(),
        });
        // clearCookie(c, 'AUTH_SESSION');
        return c.json(response);
    })

    /**
     * Handle all other requests for auth endpoints
     */
    .on(['POST', 'GET'], '*', async (c) => auth.handler(c.req.raw));

export default app;
