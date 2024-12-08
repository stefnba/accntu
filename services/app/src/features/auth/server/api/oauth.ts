import { getLoginAttemptCookie } from '@/features/auth/server/cookies/login-record';
import {
    makeLoginAttemptSuccess,
    recordLoginAttempt
} from '@features/auth/server/actions';
import { login } from '@features/auth/server/hono/actions/authenticate';
import {
    initiateGitHubOAuth,
    verifyGitHubOAuth
} from '@features/auth/server/oauth/github/actions';
import { github } from '@features/auth/server/oauth/github/provider';
import { zValidator } from '@hono/zod-validator';
import { OAuth2RequestError } from 'arctic';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';

const app = new Hono()
    .get('/github/init', async (c) => {
        const { state, url } = await initiateGitHubOAuth();

        // record login attempt with db and cookie
        await recordLoginAttempt(c, { method: 'GITHUB_OAUTH' });

        // set state in cookie
        setCookie(c, github.cookieName, state, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60 * 10, // 10 minutes
            sameSite: 'Lax'
        });

        return c.json({ url });
    })
    .get(
        '/github/verify',
        zValidator(
            'query',
            z.object({
                code: z.string(),
                state: z.string()
            })
        ),
        async (c) => {
            try {
                const { code, state } = c.req.valid('query');

                const storedState = getCookie(c, github.cookieName) ?? null;
                deleteCookie(c, github.cookieName);

                if (!code || !state || !storedState || state !== storedState) {
                    return c.json({ error: '' }, 400);
                }

                const { userId, success } = await verifyGitHubOAuth(code);

                if (!success) {
                    return c.json(
                        {
                            error: 'Failed to verify GitHub OAuth'
                        },
                        400
                    );
                }
                const loginAttemptToken = await getLoginAttemptCookie(c, true);
                // if verification was successful, mark the login attempt as successful
                await makeLoginAttemptSuccess({
                    id: loginAttemptToken,
                    userId
                });

                // login user via Hono
                await login(c, userId);

                return c.redirect('/', 301);
            } catch (e) {
                // the specific error message depends on the provider
                if (e instanceof OAuth2RequestError) {
                    // invalid code
                    return c.json(
                        {
                            error: 'Invalid code'
                        },
                        400
                    );
                }
                throw e;
            }
        }
    );

export default app;
