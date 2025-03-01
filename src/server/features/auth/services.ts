import { OptType } from '@/server/db/schemas/auth';
import { createId } from '@paralleldrive/cuid2';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from './constants';
import * as queries from './queries';
import { User } from './schemas';
import { generateOTP } from './utils';

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
    try {
        const sessionId = createId();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 1 week from now

        await queries.createSessionRecord(sessionId, userId, expiresAt, ipAddress, userAgent);

        return sessionId;
    } catch (error) {
        console.error('Error creating session:', error);
        throw new Error('Failed to create session');
    }
};

export const getSessionById = async (sessionId: string) => {
    try {
        const sessionData = await queries.getSessionRecord(sessionId);

        if (!sessionData) {
            return null;
        }

        // Check if session is expired
        if (new Date() > sessionData.expiresAt) {
            await queries.deleteSessionRecord(sessionId);
            return null;
        }

        // Update last active time
        await queries.updateSessionLastActive(sessionId);

        return sessionData;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
        await queries.deleteSessionRecord(sessionId);
        return true;
    } catch (error) {
        console.error('Error deleting session:', error);
        return false;
    }
};

// Cookie Management
export const setSessionCookie = (c: Context, sessionId: string): void => {
    setCookie(c, AUTH_COOKIE_NAME, sessionId, COOKIE_OPTIONS);
};

export const getSessionFromCookie = (c: Context): string | undefined => {
    return getCookie(c, AUTH_COOKIE_NAME);
};

export const clearSessionCookie = (c: Context): void => {
    deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' });
};

// User Authentication
export const authenticateUser = async (email: string): Promise<User | null> => {
    try {
        const userData = await queries.getUserByEmail(email);

        if (!userData) {
            return null;
        }

        return {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};

export const registerUser = async (email: string, name: string): Promise<User | null> => {
    try {
        // Check if user already exists
        const existingUser = await queries.getUserByEmail(email);

        if (existingUser) {
            return {
                id: existingUser.id,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
            };
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

        return {
            id: userId,
            email,
            firstName,
            lastName,
        };
    } catch (error) {
        console.error('Registration error:', error);
        return null;
    }
};

export const validateSession = async (sessionId: string): Promise<User | null> => {
    try {
        const sessionData = await getSessionById(sessionId);

        if (!sessionData) {
            return null;
        }

        const userData = await queries.getUserById(sessionData.userId);

        if (!userData) {
            return null;
        }

        return {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
        };
    } catch (error) {
        console.error('Session validation error:', error);
        return null;
    }
};

// Social Login
export const authenticateWithSocial = async (profile: SocialProfile): Promise<User | null> => {
    try {
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
            } else {
                // Create new user
                const nameParts = profile.name?.split(' ') || [profile.email.split('@')[0]];
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

                userId = createId();
                await queries.createUser(userId, profile.email, firstName, lastName);
            }

            // Create social account
            await queries.createAuthAccount(userId, profile.provider, profile.id);
        }

        // Get user data
        const userData = await queries.getUserById(userId);

        if (!userData) {
            return null;
        }

        return {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
        };
    } catch (error) {
        console.error('Social authentication error:', error);
        return null;
    }
};

// OTP Authentication
export const createOTP = async (userId: string, type: OptType = 'login'): Promise<string> => {
    try {
        // Generate OTP
        const otp = generateOTP(6);

        // Set expiration (10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Store in database
        await queries.createVerificationToken(createId(), otp, userId, type, expiresAt);

        return otp;
    } catch (error) {
        console.error('Error creating OTP:', error);
        throw new Error('Failed to create OTP');
    }
};

export const verifyOTP = async (
    userId: string,
    token: string,
    type: OptType = 'login'
): Promise<boolean> => {
    try {
        // Find token
        const tokenData = await queries.getVerificationToken(userId, token, type);

        if (!tokenData) {
            return false;
        }

        // Check if expired
        if (new Date() > tokenData.expiresAt || tokenData.usedAt) {
            return false;
        }

        // Mark as used
        await queries.markTokenAsUsed(tokenData.id);

        return true;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
};

// Email OTP Login
export const loginWithOTP = async (
    email: string
): Promise<{ userId: string; otp: string } | null> => {
    try {
        // Find or create user
        let user = await authenticateUser(email);

        if (!user) {
            // Create user if they don't exist
            user = await registerUser(email, email.split('@')[0]);
            if (!user) {
                return null;
            }
        }

        // Create OTP
        const otp = await createOTP(user.id);

        return {
            userId: user.id,
            otp,
        };
    } catch (error) {
        console.error('Error with OTP login:', error);
        return null;
    }
};
