import { EmailLoginSchema } from '@/server/features/auth/schemas';
import { loginWithEmailOTP } from '@/server/features/auth/services/email-otp';
import { withMutationRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { setOTPTokenCookie } from './services';
// Validation schemas

const SignupSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
});

const SocialLoginSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    provider: z.enum(['github', 'google', 'apple']),
});

// Create Hono app for auth routes
const app = new Hono()

    // Email login - request OTP
    .post('/request-otp', zValidator('json', EmailLoginSchema), async (c) =>
        withMutationRoute(c, async () => {
            const { email } = c.req.valid('json');

            // Generate OTP and send it
            const { token } = await loginWithEmailOTP(email);

            // Set token in HTTP-only cookie
            setOTPTokenCookie(c, token);

            // Set email in a cookie for the verification page
            setCookie(c, 'auth_email', email, {
                httpOnly: false,
                path: '/',
                maxAge: 60 * 10, // 10 minutes
                sameSite: 'Lax',
            });

            // Return success response
            return { message: 'OTP sent successfully' };
        })
    );

//     // Return success response
//     return c.json(createSuccessResponse({ message: 'OTP sent successfully' }), 201);})
//     try {

//     } catch (error: unknown) {
//         // This is just for type inference with Hono RPC
//         // The actual error handling will be done by the global error handler
//         if (error instanceof BaseError) {
//             // Return a typed error response based on the error's status code
//             // This is just for type inference with Hono RPC
//             const statusCode = ensureErrorStatusCode(error.statusCode || 500);

//             // For RPC type inference only - this creates the correct type signature
//             // We use a condition that TypeScript can't prove is always false
//             // but we know will never be true at runtime
//             if (false as boolean) {
//                 // This code is never executed, it's just for type inference
//                 return c.json(error.toResponse(), statusCode);
//             }

//             // Rethrow to let the global error handler deal with it
//             throw error;
//         }

//         // For unknown errors, provide a 500 type and rethrow
//         // For RPC type inference only
//         if (false as boolean) {
//             // This code is never executed, it's just for type inference
//             return c.json(
//                 errorFactory
//                     .createError({
//                         message: 'An unexpected error occurred',
//                         code: 'INTERNAL_SERVER_ERROR',
//                         statusCode: 500,
//                     })
//                     .toResponse(),
//                 500
//             );
//         }

//         // Rethrow to let the global error handler deal with it
//         throw error;
//     }
// })

// Verify OTP and login
// .post('/verify-otp', zValidator('json', OTPVerifySchema), async (c) => {
//     const { code } = c.req.valid('json');

//     // Get token from cookie
//     const token = getOTPTokenFromCookie(c);

//     if (!token) {
//         return c.json({ error: 'OTP session expired or invalid' }, 401);
//     }

//     // Verify OTP with token
//     const verification = await verifyOTPWithToken(token, code);

//     if (!verification.valid || !verification.email) {
//         return c.json({ error: 'Invalid or expired OTP' }, 401);
//     }

//     // Find user by email
//     const user = await authenticateUser(verification.email);

//     if (!user) {
//         return c.json({ error: 'User not found' }, 404);
//     }

//     // Create session
//     const sessionId = await createSession(
//         user.id,
//         c.req.header('x-forwarded-for'),
//         c.req.header('user-agent')
//     );

//     // Set session cookie
//     setSessionCookie(c, sessionId);

//     // Clear the email cookie as it's no longer needed
//     setCookie(c, 'auth_email', '', {
//         httpOnly: false,
//         path: '/',
//         maxAge: 0, // Expire immediately
//         sameSite: 'Lax',
//     });

//     return c.json({ user });
// })

// // Signup route
// .post('/signup', zValidator('json', SignupSchema), async (c) => {
//     const { email, name } = c.req.valid('json');

//     // Register the user
//     const user = await registerUser(email, name);

//     if (!user) {
//         return c.json({ error: 'Failed to register user' }, 500);
//     }

//     // Generate OTP for verification
//     const result = await loginWithOTP(email);

//     if (!result) {
//         return c.json({ error: 'Failed to generate OTP' }, 500);
//     }

//     // Set token in HTTP-only cookie
//     setOTPTokenCookie(c, result.token);

//     // Set email in a cookie for the verification page
//     setCookie(c, 'auth_email', email, {
//         httpOnly: false,
//         path: '/',
//         maxAge: 60 * 10, // 10 minutes
//         sameSite: 'Lax',
//     });

//     if (process.env.NODE_ENV !== 'production') {
//         return c.json({
//             message: 'User registered successfully. OTP sent for verification.',
//             user,
//             otp: result.otp,
//         });
//     }

//     return c.json({
//         message: 'User registered successfully. OTP sent for verification.',
//         user,
//     });
// })

// // Logout route
// .post('/logout', async (c) => {
//     // Get session ID from cookie
//     const sessionId = getSessionFromCookie(c);

//     if (sessionId) {
//         // Delete session from database
//         await deleteSession(sessionId);
//     }

//     // Clear the auth cookie
//     clearSessionCookie(c);

//     return c.json({ success: true });
// })

// // Get current user route
// .get('/me', async (c) => {
//     const sessionId = getSessionFromCookie(c);
//     if (!sessionId) {
//         return c.json({ error: 'No session' }, 401);
//     }

//     const user = await validateSession(sessionId);
//     if (!user) {
//         clearSessionCookie(c);
//         return c.json({ error: 'Session expired' }, 401);
//     }

//     return c.json(user);
// })

// // GitHub auth routes
// .get('/github/authorize', async (c) => {
//     const state = generateState();
//     const scopes = ['user:email']; // Add required scopes
//     const url = await github.createAuthorizationURL(state, scopes);

//     // Store state in cookie for verification
//     setCookie(c, `github_oauth_state_${state}`, state, {
//         httpOnly: true,
//         path: '/',
//         maxAge: 60 * 10, // 10 minutes
//         sameSite: 'Lax',
//     });

//     return c.json({ url: url.toString() });
// })
// .get('/github/callback', async (c) => {
//     const code = c.req.query('code');
//     const state = c.req.query('state');

//     if (!state) {
//         return c.json({ error: 'No state provided' }, 400);
//     }

//     const storedState = getCookie(c, `github_oauth_state_${state}`);
//     if (!storedState || storedState !== state) {
//         return c.json({ error: 'Invalid state' }, 400);
//     }

//     if (!code) {
//         return c.json({ error: 'No code provided' }, 400);
//     }

//     // Exchange code for tokens
//     const tokens = await github.validateAuthorizationCode(code);
//     const accessToken = tokens.accessToken();

//     // Get user info from GitHub
//     const githubUserResponse = await fetch('https://api.github.com/user', {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//         },
//     });
//     const githubUser: GitHubUser = await githubUserResponse.json();

//     const response = await fetch('https://api.github.com/user/emails', {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//         },
//     });
//     const githubEmail: GitHubEmail[] = await response.json();
//     const primaryEmail = githubEmail.find((email) => email.primary)?.email ?? null;

//     if (!primaryEmail) {
//         throw new Error('No primary email found');
//     }

//     // Use your existing social auth logic
//     const user = await authenticateWithSocial({
//         id: githubUser.id.toString(),
//         email: primaryEmail,
//         name: githubUser.name || githubUser.login,
//         provider: 'github',
//     });

//     if (!user) {
//         return c.json({ error: 'Failed to authenticate with GitHub' }, 500);
//     }

//     // Create session
//     const sessionId = await createSession(
//         user.id,
//         c.req.header('x-forwarded-for'),
//         c.req.header('user-agent')
//     );

//     // Set session cookie
//     setSessionCookie(c, sessionId);

//     // Redirect to frontend
//     return c.redirect('/dashboard');
// })

// // Google auth routes
// .get('/google/authorize', async (c) => {
//     const state = generateState();
//     setCookie(c, `google_oauth_state_${state}`, state, { maxAge: 60 * 10 }); // 10 minutes
// })
// .post('/google/callback', async (c) => {})

// // Apple auth routes
// .get('/apple/authorize', async (c) => {})
// .get('/apple/callback', async (c) => {});

export default app;
