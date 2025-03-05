import { OAuthProviderSchema } from '@/server/db/schemas';
import { EmailLoginSchema, OTPVerifySchema, SignupSchema } from '@/server/features/auth/schemas';
import { sessionServices } from '@/server/features/auth/services';
import {
    initiateLoginWithEmailOTP,
    verifyLoginWithEmailOTP,
} from '@/server/features/auth/services/email-otp';
import * as userServices from '@/server/features/user/services';
import {
    clearCookie,
    COOKIE_NAMES_AUTH,
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
        zValidator(
            'cookie',
            z.object({
                [COOKIE_NAMES_AUTH.AUTH_OTP_TOKEN]: z.string(),
                [COOKIE_NAMES_AUTH.AUTH_OTP_EMAIL]: z.string(),
            })
        ),
        async (c) =>
            withMutationRoute(c, async () => {
                const { code } = c.req.valid('json');
                const {
                    [COOKIE_NAMES_AUTH.AUTH_OTP_EMAIL]: email,
                    [COOKIE_NAMES_AUTH.AUTH_OTP_TOKEN]: token,
                } = c.req.valid('cookie');

                // Verify OTP with token
                const user = await verifyLoginWithEmailOTP({ token, otp: code, email });

                // Create session
                const { id: sessionId } = await sessionServices.createSession({
                    userId: user.id,
                    ipAddress: c.req.header('x-forwarded-for'),
                    userAgent: c.req.header('user-agent'),
                });

                setSessionCookie(c, 'SESSION', sessionId);

                return { message: 'Login successful' };
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

    .post('/logout', async (c) =>
        withMutationRoute(c, async () => {
            clearCookie(c, 'SESSION');
            return { message: 'Logout successful' };
        })
    )

    // GitHub oauth
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
