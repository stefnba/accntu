import { recordLoginAttempt } from '@auth/actions/login-record';
import {
    initiateGitHubOAuth,
    verifyGitHubOAuth
} from '@auth/actions/oauth/github';
import { createSession } from '@auth/authenticate';
import { github } from '@auth/oauth/github';
import { zValidator } from '@hono/zod-validator';
import { OAuth2RequestError } from 'arctic';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';

const app = new Hono()
    .get('/github/init', async (c) => {
        const { state, url } = await initiateGitHubOAuth();

        // todo login attempt cookie

        //
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

                // create session
                await createSession(c, userId);

                // record login attempt
                await recordLoginAttempt(
                    {
                        method: 'GITHUB',
                        userId
                    },
                    true
                );

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
// .get('/google/init', (c) => c.json('Logout'))
// .post('/google/verify', (c) => c.json('Login', 201));

export default app;
