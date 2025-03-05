import { OptType } from '@/server/db/schemas/auth';
import { TUser } from '@/server/db/schemas/user';
import { getUserByEmail } from '@/server/features/user/queries';
import { errorFactory } from '@/server/lib/error';
import { createId } from '@paralleldrive/cuid2';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from './constants';
import * as queries from './queries';
import { generateOTP, generateSecureToken, hashOTP, verifyOTP as verifyOTPHash } from './utils';

export type Provider = 'email' | 'github' | 'google';

export type SocialProfile = {
    id: string;
    email: string;
    name?: string;
    provider: Provider;
};

// Session Management
export const createSession = async (
    userId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<string> => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 1 week from now

    await queries.createSessionRecord({
        userId,
        expiresAt,
        ipAddress,
        userAgent,
    });

    return sessionId;
};

export const getSessionById = async (sessionId: string) => {
    const sessionData = await queries.getSessionRecord(sessionId);

    if (!sessionData) {
        return null;
    }

    // Check if session is expired
    if (new Date() > sessionData.expiresAt) {
        await queries.deleteSessionRecord(sessionId);
        throw errorFactory.createAuthError({
            message: 'Session has expired',
            code: 'AUTH.SESSION_EXPIRED',
        });
    }

    // Update last active time
    await queries.updateSessionLastActive(sessionId);

    return sessionData;
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
    await queries.deleteSessionRecord(sessionId);
    return true;
};

// Cookie Management

/**
 * Set the session ID in the cookie
 * @param c - The context object
 * @param sessionId - The session ID to set
 */
export const setSessionCookie = (c: Context, sessionId: string): void => {
    setCookie(c, AUTH_COOKIE_NAME, sessionId, COOKIE_OPTIONS);
};

/**
 * Get the session ID from the cookie
 * @param c - The context object
 * @returns The session ID if found, otherwise undefined
 */
export const getSessionFromCookie = (c: Context): string | undefined => {
    return getCookie(c, AUTH_COOKIE_NAME);
};

export const clearSessionCookie = (c: Context): void => {
    deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' });
};

// User Authentication



/**
 * Register a new user
 * @param email - The email of the user
 * @param name - The name of the user
 */
export const registerUser = async (email: string, name: string): Promise<TUser> => {
    // Check if user already exists
    const existingUser = await queries.getUserByEmail(email);

    if (existingUser) {
        throw createAuthError('Email already registered', 'AUTH.EMAIL_EXISTS', 409);
    }

    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

    // Create new user
    const userId = createId();
    await queries.createUser(userId, email, firstName, lastName || undefined);

    // Create email account
    await queries.createAuthAccount(userId, 'email', email);

    // Get the created user
    const userData = await queries.getUserById(userId);

    if (!userData) {
        throw createAuthError('Failed to create user', 'INTERNAL_SERVER_ERROR', 500);
    }

    return userData;
};

/**
 * Validate a session
 * @param sessionId - The ID of the session
 */
export const validateSession = async (sessionId: string): Promise<TUser> => {
    const sessionData = await getSessionById(sessionId);

    if (!sessionData) {
        throw createAuthError('Session not found', 'AUTH.SESSION_NOT_FOUND', 401);
    }

    const userData = await queries.getUserById(sessionData.userId);

    if (!userData) {
        throw createAuthError('User not found', 'AUTH.USER_NOT_FOUND', 404);
    }

    return userData;
};

/**
 * Authenticate a user with a social provider
 * @param profile - The social profile
 */
export const authenticateWithSocial = async (profile: SocialProfile): Promise<TUser> => {
    // Check if account exists
    const accountData = await queries.getAccountByProviderAndId(profile.provider, profile.id);

    let userId: string;

    if (accountData) {
        // Account exists, get user
        userId = accountData.userId;
    } else {
        // Check if user exists with this email
        const userData = await queries.getUserByEmail(profile.email);

        if (userData) {
            // User exists, link account
            userId = userData.id;
            await queries.createAuthAccount(userId, profile.provider, profile.id);
        } else {
            // Create new user
            const name = profile.name || profile.email.split('@')[0];
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

            // Generate a unique user ID
            userId = createId();

            // Create user in database
            await queries.createUser(userId, profile.email, firstName, lastName || undefined);

            // Create social account
            await queries.createAuthAccount(userId, profile.provider, profile.id);
        }
    }

    // Get user data
    const userData = await queries.getUserById(userId);

    if (!userData) {
        throw createAuthError('User not found', 'AUTH.USER_NOT_FOUND', 404);
    }

    return userData;
};

// OTP Authentication
export const createOTP = async (userId: string, type: OptType = 'login'): Promise<string> => {
    // Generate OTP
    const otp = generateOTP(6);

    // Set expiration (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store in database
    await queries.createVerificationToken(otp, userId, type, expiresAt);

    return otp;
};

export const verifyOTP = async (
    userId: string,
    token: string,
    type: OptType = 'login'
): Promise<boolean> => {
    // Find token
    const tokenData = await queries.getVerificationToken(userId, token, type);

    if (!tokenData) {
        throw createAuthError('Invalid OTP', 'AUTH.INVALID_OTP', 401);
    }

    // Check if expired
    if (new Date() > tokenData.expiresAt) {
        throw createAuthError('OTP has expired', 'AUTH.OTP_EXPIRED', 401);
    }

    // Check if already used
    if (tokenData.usedAt) {
        throw createAuthError('OTP has already been used', 'AUTH.INVALID_OTP', 401);
    }

    // Mark as used
    await queries.markTokenAsUsed(token);

    return true;
};

// Email OTP Login


// Set OTP token cookie
export const setOTPTokenCookie = (c: Context, token: string): void => {
    setCookie(c, 'otp_token', token, {
        ...COOKIE_OPTIONS,
        maxAge: 10 * 60, // 10 minutes
    });
};

// Get OTP token from cookie
export const getOTPTokenFromCookie = (c: Context): string | undefined => {
    return getCookie(c, 'otp_token');
};

// Clear OTP token cookie
export const clearOTPTokenCookie = (c: Context): void => {
    deleteCookie(c, 'otp_token', { path: '/' });
};

// Verify OTP with token
export const verifyOTPWithToken = async (
    token: string,
    otpCode: string
): Promise<{ valid: boolean; email?: string }> => {
    try {
        // Find token
        const tokenData = await queries.getVerificationTokenByToken(token);

        if (!tokenData) {
            return { valid: false };
        }

        // Check if token is expired
        if (new Date() > tokenData.expiresAt || tokenData.usedAt) {
            return { valid: false };
        }

        // Check if too many attempts
        if (tokenData.attempts && tokenData.attempts >= 5) {
            return { valid: false };
        }

        // Increment attempts
        await queries.incrementVerificationTokenAttempts(token);

        // Verify OTP
        const isValid = verifyOTPHash(otpCode, tokenData.tokenHash || '', tokenData.email || '');

        if (isValid) {
            // Mark token as used
            await queries.markTokenAsUsed(token);
            return { valid: true, email: tokenData.email || '' };
        }

        return { valid: false };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { valid: false };
    }
};
