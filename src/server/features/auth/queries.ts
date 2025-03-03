import { db } from '@/server/db';
import {
    authAccount,
    OptType,
    session,
    TUser,
    user,
    userSettings,
    verificationToken,
} from '@/server/db/schemas';

import { and, eq, sql } from 'drizzle-orm';

// Session queries

/**
 * Create a session record
 * @param sessionId - The ID of the session
 * @param userId - The ID of the user
 * @param expiresAt - The expiration date of the session
 * @param ipAddress - The IP address of the user
 * @param userAgent - The user agent of the user
 */
export const createSessionRecord = async (
    sessionId: string,
    userId: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
) => {
    return db.insert(session).values({
        id: sessionId,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        lastActiveAt: new Date(),
    });
};

/**
 * Get a session record by ID
 * @param sessionId - The ID of the session
 * @returns The session if found, otherwise null
 */
export const getSessionRecord = async (sessionId: string) => {
    const sessions = await db.select().from(session).where(eq(session.id, sessionId)).limit(1);
    return sessions.length ? sessions[0] : null;
};

/**
 * Update the last active time of a session
 * @param sessionId - The ID of the session to update
 */
export const updateSessionLastActive = async (sessionId: string) => {
    return db.update(session).set({ lastActiveAt: new Date() }).where(eq(session.id, sessionId));
};

/**
 * Delete a session record
 * @param sessionId - The ID of the session to delete
 */
export const deleteSessionRecord = async (sessionId: string) => {
    return db.delete(session).where(eq(session.id, sessionId));
};

// User queries

/**
 * Get a user by email
 * @param email - The email of the user
 * @returns The user if found, otherwise null
 */
export const getUserByEmail = async (email: string) => {
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return users.length ? users[0] : null;
};

/**
 * Get a user by ID
 * @param userId - The ID of the user
 * @returns The user if found, otherwise null
 */
export const getUserById = async (userId: string): Promise<TUser | null> => {
    const users = await db
        .select({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            role: user.role,
            settings: userSettings,
        })
        .from(user)
        .innerJoin(userSettings, eq(user.id, userSettings.userId))
        .where(eq(user.id, userId))
        .limit(1);

    return users.length ? users[0] : null;
};

/**
 * Create a user
 * @param userId - The ID of the user
 * @param email - The email of the user
 * @param firstName - The first name of the user
 * @param lastName - The last name of the user
 */
export const createUser = async (
    userId: string,
    email: string,
    firstName: string,
    lastName?: string
) => {
    return db.insert(user).values({
        id: userId,
        email,
        firstName,
        lastName,
    });
};

/**
 * Get an auth account by provider and provider account ID
 * @param provider - The authentication provider
 * @param providerAccountId - The ID of the provider account
 * @returns The auth account if found, otherwise null
 */
export const getAccountByProviderAndId = async (
    provider: 'email' | 'github' | 'google',
    providerAccountId: string
) => {
    const accounts = await db
        .select()
        .from(authAccount)
        .where(
            and(
                eq(authAccount.provider, provider),
                eq(authAccount.providerAccountId, providerAccountId)
            )
        )
        .limit(1);
    return accounts.length ? accounts[0] : null;
};

/**
 * Create an auth account
 * @param userId - The ID of the user
 * @param provider - The authentication provider
 * @param providerAccountId - The ID of the provider account
 */
export const createAuthAccount = async (
    userId: string,
    provider: 'email' | 'github' | 'google',
    providerAccountId: string
) => {
    return db.insert(authAccount).values({
        userId,
        provider,
        providerAccountId,
    });
};

/**
 * Get a user's auth account by user ID and provider
 * @param userId - The ID of the user
 * @param provider - The authentication provider
 * @returns The auth account if found, otherwise null
 */
export const getAccountByUserIdAndProvider = async (
    userId: string,
    provider: 'email' | 'github' | 'google'
) => {
    const accounts = await db
        .select()
        .from(authAccount)
        .where(and(eq(authAccount.userId, userId), eq(authAccount.provider, provider)))
        .limit(1);
    return accounts.length ? accounts[0] : null;
};

/**
 * Create a verification token
 * @param token - The token to create
 * @param userId - The ID of the user
 * @param type - The type of token to create
 * @param expiresAt - The expiration date of the token
 */
export const createVerificationToken = async (
    token: string,
    userId: string,
    type: OptType,
    expiresAt: Date
) => {
    return db.insert(verificationToken).values({
        token,
        userId,
        type,
        expiresAt,
    });
};

/**
 * Get a verification token by user ID, token, and type
 * @param userId - The ID of the user
 * @param token - The token to search for
 * @param type - The type of token to search for
 * @returns The verification token if found, otherwise null
 */
export const getVerificationToken = async (userId: string, token: string, type: OptType) => {
    const tokens = await db
        .select()
        .from(verificationToken)
        .where(
            and(
                eq(verificationToken.userId, userId),
                eq(verificationToken.token, token),
                eq(verificationToken.type, type)
            )
        )
        .limit(1);
    return tokens.length ? tokens[0] : null;
};

/**
 * Mark a verification token as used
 * @param token - The token to mark as used
 */
export const markTokenAsUsed = async (token: string) => {
    return db
        .update(verificationToken)
        .set({ usedAt: new Date() })
        .where(eq(verificationToken.token, token));
};

/**
 * Create a verification token for email OTP
 * @param token - Secure random token
 * @param email - User's email
 * @param otpHash - Hashed OTP code
 * @param type - Token type
 * @param expiresAt - Expiration date
 */
export const createEmailVerificationToken = async (
    token: string,
    email: string,
    otpHash: string,
    type: OptType,
    expiresAt: Date
) => {
    return db.insert(verificationToken).values({
        token,
        email,
        tokenHash: otpHash,
        type,
        expiresAt,
    });
};

/**
 * Get a verification token by token string
 * @param token - The token string
 */
export const getVerificationTokenByToken = async (token: string) => {
    const result = await db
        .select()
        .from(verificationToken)
        .where(eq(verificationToken.token, token))
        .limit(1);

    return result[0] || null;
};

/**
 * Update verification token attempts counter
 * @param token - The token
 */
export const incrementVerificationTokenAttempts = async (token: string) => {
    return db
        .update(verificationToken)
        .set({
            attempts: sql`${verificationToken.attempts} + 1`,
        })
        .where(eq(verificationToken.token, token));
};

/**
 * Delete expired verification tokens
 * @remarks This should be run periodically to clean up the database
 * @todo Implement a scheduled job to clean up expired tokens
 */
export const deleteExpiredVerificationTokens = async () => {
    const now = new Date();
    return db
        .delete(verificationToken)
        .where(
            and(
                sql`${verificationToken.usedAt} IS NOT NULL`,
                sql`${verificationToken.expiresAt} < ${now}`
            )
        );
};
