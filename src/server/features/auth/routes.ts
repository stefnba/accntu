import { github } from '@/server/features/auth/oauth';
import { zValidator } from '@hono/zod-validator';
import { generateState } from 'arctic';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import { GitHubEmail, GitHubUser } from './oauth';
import { OTPVerifySchema } from './schemas';
import {
    authenticateUser,
    authenticateWithSocial,
    clearSessionCookie,
    createSession,
    deleteSession,
    getOTPTokenFromCookie,
    getSessionFromCookie,
    loginWithOTP,
    registerUser,
    setOTPTokenCookie,
    setSessionCookie,
    validateSession,
    verifyOTPWithToken,
} from './services';

// Validation schemas
const LoginSchema = z.object({
    email: z.string().email(),
});

const SignupSchema = z.object({
    email: z.string().email(),
    name: z.string(),
});

const SocialLoginSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    provider: z.enum(['github', 'google']),
});

// Create Hono app for auth routes
const app = new Hono()
    // Email login - request OTP
    .post('/request-otp', zValidator('json', LoginSchema), async (c) => {
        try {
            const { email } = c.req.valid('json');

            // Generate OTP for user
            const result = await loginWithOTP(email);

            if (!result) {
                return c.json({ error: 'Failed to generate OTP' }, 500);
            }

            // Set token in HTTP-only cookie
            setOTPTokenCookie(c, result.token);

            // In a real app, you would send the OTP via email
            // For development, return it in the response
            if (process.env.NODE_ENV !== 'production') {
                return c.json({
                    message: 'OTP sent successfully',
                    otp: result.otp,
                    userId: result.userId,
                });
            }

            return c.json({ message: 'OTP sent successfully' });
        } catch (error) {
            console.error('Login error:', error);
            return c.json({ error: 'Failed to login' }, 500);
        }
    })

    // Verify OTP and login
    .post('/verify-otp', zValidator('json', OTPVerifySchema), async (c) => {
        try {
            const { code } = c.req.valid('json');

            // Get token from cookie
            const token = getOTPTokenFromCookie(c);

            if (!token) {
                return c.json({ error: 'OTP session expired or invalid' }, 401);
            }

            // Verify OTP with token
            const verification = await verifyOTPWithToken(token, code);

            if (!verification.valid || !verification.email) {
                return c.json({ error: 'Invalid or expired OTP' }, 401);
            }

            // Find user by email
            const user = await authenticateUser(verification.email);

            if (!user) {
                return c.json({ error: 'User not found' }, 404);
            }

            // Create session
            const sessionId = await createSession(
                user.id,
                c.req.header('x-forwarded-for'),
                c.req.header('user-agent')
            );

            // Set session cookie
            setSessionCookie(c, sessionId);

            return c.json({ user });
        } catch (error) {
            console.error('OTP verification error:', error);
            return c.json({ error: 'Failed to verify OTP' }, 500);
        }
    })

    // Signup route
    .post('/signup', zValidator('json', SignupSchema), async (c) => {
        try {
            const { email, name } = c.req.valid('json');

            // Register the user
            const user = await registerUser(email, name);

            if (!user) {
                return c.json({ error: 'Failed to register user' }, 500);
            }

            // Generate OTP for verification
            const result = await loginWithOTP(email);

            if (!result) {
                return c.json({ error: 'Failed to generate OTP' }, 500);
            }

            // In a real app, you would send the OTP via email
            // For development, return it in the response
            if (process.env.NODE_ENV !== 'production') {
                return c.json({
                    message: 'User registered successfully. OTP sent for verification.',
                    user,
                    otp: result.otp,
                });
            }

            return c.json({
                message: 'User registered successfully. OTP sent for verification.',
                user,
            });
        } catch (error) {
            console.error('Signup error:', error);
            return c.json({ error: 'Failed to signup' }, 500);
        }
    })

    // Logout route
    .post('/logout', async (c) => {
        try {
            // Get session ID from cookie
            const sessionId = getSessionFromCookie(c);

            if (sessionId) {
                // Delete session from database
                await deleteSession(sessionId);
            }

            // Clear the auth cookie
            clearSessionCookie(c);

            return c.json({ success: true });
        } catch (error) {
            console.error('Logout error:', error);
            return c.json({ error: 'Failed to logout' }, 500);
        }
    })

    // Get current user route
    .get('/me', async (c) => {
        try {
            // Get the auth cookie
            const sessionId = getSessionFromCookie(c);

            if (!sessionId) {
                return c.json({ user: null }, 401);
            }

            // Validate the session
            const user = await validateSession(sessionId);

            if (!user) {
                // Invalid session, clear the cookie
                clearSessionCookie(c);
                return c.json({ user: null }, 401);
            }

            return c.json(user);
        } catch (error) {
            console.error('Error getting user from session:', error);
            return c.json({ error: 'Failed to get user' }, 500);
        }
    })

    // GitHub auth routes
    .get('/github/authorize', async (c) => {
        const state = generateState();
        // Store state in cookie for verification later
        setCookie(c, `github_oauth_state_${state}`, state, { maxAge: 60 * 10 }); // 10 minutes

        const url = github.createAuthorizationURL(state, ['user:email']);
        return c.json({ url: url.toString(), state });
    })
    .post('/github/callback', async (c) => {
        try {
            const code = c.req.query('code');
            const state = c.req.query('state');

            // Verify state
            const storedState = getCookie(c, `github_oauth_state_${state}`);
            if (!storedState || storedState !== state) {
                return c.json({ error: 'Invalid state' }, 400);
            }

            if (!code) {
                return c.json({ error: 'No code provided' }, 400);
            }

            // Exchange code for tokens
            const tokens = await github.validateAuthorizationCode(code);
            const accessToken = tokens.accessToken();

            // Get user info from GitHub
            const githubUserResponse = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const githubUser: GitHubUser = await githubUserResponse.json();

            const response = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const githubEmail: GitHubEmail[] = await response.json();
            const primaryEmail = githubEmail.find((email) => email.primary)?.email ?? null;

            if (!primaryEmail) {
                // todo handle error
                throw new Error('No primary email found');
            }

            // Use your existing social auth logic
            const user = await authenticateWithSocial({
                id: githubUser.id.toString(),
                email: primaryEmail,
                name: githubUser.name || githubUser.login,
                provider: 'github',
            });

            if (!user) {
                return c.json({ error: 'Failed to authenticate with GitHub' }, 500);
            }

            // Create session
            const sessionId = await createSession(
                user.id,
                c.req.header('x-forwarded-for'),
                c.req.header('user-agent')
            );

            // Set session cookie
            setSessionCookie(c, sessionId);

            // Redirect to frontend
            return c.redirect('/dashboard');
        } catch (error) {
            console.error('GitHub callback error:', error);
            return c.json({ error: 'Failed to authenticate with GitHub' }, 500);
        }
    })

    // Google auth routes
    .get('/google/authorize', async (c) => {
        const state = generateState();
        setCookie(c, `google_oauth_state_${state}`, state, { maxAge: 60 * 10 }); // 10 minutes
    })
    .post('/google/callback', async (c) => {})

    // Apple auth routes
    .get('/apple/authorize', async (c) => {})
    .get('/apple/callback', async (c) => {});

export default app;
