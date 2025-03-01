import { db } from '@/server/db';
import { authAccount, OptType, session, verificationToken } from '@/server/db/schemas/auth';
import { user } from '@/server/db/schemas/user';
import { and, eq } from 'drizzle-orm';

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
export const getUserById = async (userId: string) => {
    const users = await db.select().from(user).where(eq(user.id, userId)).limit(1);
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
 * @param tokenId - The ID of the token
 * @param token - The token to create
 * @param userId - The ID of the user
 * @param type - The type of token to create
 */
export const createVerificationToken = async (
    tokenId: string,
    token: string,
    userId: string,
    type: OptType,
    expiresAt: Date
) => {
    return db.insert(verificationToken).values({
        id: tokenId,
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
 * @param tokenId - The ID of the token to mark as used
 */
export const markTokenAsUsed = async (tokenId: string) => {
    return db
        .update(verificationToken)
        .set({ usedAt: new Date() })
        .where(eq(verificationToken.id, tokenId));
};
