import { OAuthProviderSchema } from '@/server/db/schemas';
import { EmailLoginSchema, OTPVerifySchema, SignupSchema } from '@/server/features/auth/schemas';
import { sessionServices } from '@/server/features/auth/services';
import {
    getSessionIdFromContext,
    getUserFromContext,
    logout,
} from '@/server/features/auth/services/auth';
import {
    initiateLoginWithEmailOTP,
    verifyLoginWithEmailOTP,
} from '@/server/features/auth/services/email-otp';
import * as userServices from '@/server/features/user/services';
import {
    clearCookie,
    getCookieValue,
    setSecureCookie,
    setSessionCookie,
} from '@/server/lib/cookies';
import { zValidator } from '@/server/lib/error/validation';
import { withMutationRoute } from '@/server/lib/handler';
import { Hono } from 'hono';
import { z } from 'zod';

// Create Hono app for auth routes
const app = new Hono()

    // Email login - request OTP
    .post('/request-otp', zValidator('json', EmailLoginSchema), async (c) =>
        withMutationRoute(c, async () => {
            const { email } = c.req.valid('json');

            // Generate OTP and send it
            const { token } = await initiateLoginWithEmailOTP({ email });

            // Set token in HTTP-only cookie
            setSecureCookie(c, 'AUTH_OTP_TOKEN', token);

            // Set email in HTTP-only cookie
            setSecureCookie(c, 'AUTH_OTP_EMAIL', email);

            // Return success response
            return { message: 'OTP sent successfully' };
        })
    )

    // Verify OTP and login
    .post(
        '/verify-otp',
        zValidator('json', OTPVerifySchema),

        async (c) =>
            withMutationRoute(c, async () => {
                const { code } = c.req.valid('json');

                const email = getCookieValue(c, 'AUTH_OTP_EMAIL', z.string());
                const token = getCookieValue(c, 'AUTH_OTP_TOKEN', z.string());

                clearCookie(c, 'AUTH_OTP_TOKEN');
                clearCookie(c, 'AUTH_OTP_EMAIL');

                // Verify OTP with token
                const user = await verifyLoginWithEmailOTP({ token, otp: code, email });

                // Create session
                const { id: sessionId } = await sessionServices.createSession({
                    userId: user.id,
                    ipAddress: c.req.header('x-forwarded-for'),
                    userAgent: c.req.header('user-agent'),
                });

                setSessionCookie(c, 'AUTH_SESSION', sessionId);

                return { message: 'Login successful', user };
            })
    )

    // Signup new user with email and name
    .post('/signup', zValidator('json', SignupSchema), async (c) =>
        withMutationRoute(c, async () => {
            const { email, name } = c.req.valid('json');

            // Register the user
            const user = await userServices.signupNewUser({ email, firstName: name });

            if (!user) {
                return c.json({ error: 'Failed to register user' }, 500);
            }

            // Generate OTP and send it
            const { token } = await initiateLoginWithEmailOTP({ email });

            // Set token in HTTP-only cookie
            setSecureCookie(c, 'AUTH_OTP_TOKEN', token);

            // Set email in HTTP-only cookie
            setSecureCookie(c, 'AUTH_OTP_EMAIL', email);

            // Return success response
            return { message: 'OTP sent successfully' };
        })
    )

    // Logout the user, i.e. delete the session
    .post('/logout', async (c) =>
        withMutationRoute(c, async () => {
            try {
                const user = getUserFromContext(c);
                const sessionId = getSessionIdFromContext(c);
                // Logout the user, i.e. delete the session
                await logout({ userId: user.id, sessionId });
                return { message: 'Logout successful' };
            } catch (error) {
                // todo better error handling for this
                console.error('Error logging out', error);
            } finally {
                // Clear session cookie, even if logout fails
                clearCookie(c, 'AUTH_SESSION');
            }
        })
    )

    // oauth
    .get(
        '/:provider/authorize',
        zValidator('param', z.object({ provider: OAuthProviderSchema })),
        async (c) => {
            const { provider } = c.req.valid('param');

            // const { url } = await oauthServices.getOAuthAuthorizationUrl({ provider });
        }
    )
    .post(
        '/:provider/callback',
        zValidator('param', z.object({ provider: OAuthProviderSchema })),
        async (c) => {
            const { provider } = c.req.valid('param');
        }
    );

export default app;
