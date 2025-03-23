import { InsertSessionSchema } from '@/server/db/schemas/auth';
import * as userQueries from '@/server/features/user/queries';
import { errorFactory } from '@/server/lib/error';
import { z } from 'zod';
import * as sessionQueries from '../queries/session';

/**
 * Create a new session
 * @param params - Session creation parameters
 * @param params.userId - The user ID
 * @param params.ipAddress - The IP address (optional)
 * @param params.userAgent - The user agent (optional)
 * @returns The created session
 */
export const createSession = async (
    params: Omit<z.infer<typeof InsertSessionSchema>, 'expiresAt'>
) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 1 week from now

    return sessionQueries.createSessionRecord({
        ...params,
        expiresAt,
    });
};

/**
 * Get a session by ID
 * @param params - Session retrieval parameters
 * @param params.sessionId - The session ID
 * @returns The session if found, otherwise null
 */
export const getSessionById = async ({ sessionId }: { sessionId: string }) => {
    return sessionQueries.getSessionRecordById({ sessionId });
};

/**
 * Get sessions by user ID
 * @param params - Session retrieval parameters
 * @param params.userId - The user ID
 * @returns Array of sessions
 */
export const getSessionsByUserId = async ({
    userId,
    currentSessionId,
}: {
    userId: string;
    currentSessionId: string;
}) => {
    return sessionQueries.getSessionRecordsByUserId({ userId, currentSessionId });
};

/**
 * Update session activity timestamp
 * @param params - Session update parameters
 * @param params.sessionId - The session ID
 * @returns The updated session
 */
export const updateSessionActivity = async ({ sessionId }: { sessionId: string }) => {
    return sessionQueries.updateSessionLastActive({ sessionId });
};

/**
 * Delete a session
 * @param params - Session deletion parameters
 * @param params.sessionId - The session ID
 * @param params.userId - The user ID
 * @returns True if successful
 */
export const deleteSession = async ({
    sessionId,
    userId,
}: {
    sessionId: string;
    userId: string;
}) => {
    await sessionQueries.deleteSessionRecord({ sessionId, userId });
    return true;
};

/**
 * Validate a session
 * @param params - Session validation parameters
 * @param params.sessionId - The session ID
 * @returns The validated session
 */
export const validateSession = async ({ sessionId }: { sessionId: string }) => {
    const session = await sessionQueries.getSessionRecordById({ sessionId });
    if (!session) {
        throw errorFactory.createAuthError({
            message: 'Session not found',
            code: 'AUTH.SESSION_NOT_FOUND',
        });
    }

    // todo: check if session is expired

    // todo get user by id
    const user = await userQueries.getUserRecordById({ userId: session.userId });

    if (!user) {
        throw errorFactory.createAuthError({
            message: 'User not found',
            code: 'AUTH.USER_NOT_FOUND',
        });
    }

    return user;
};

/**
 * Revoke a specific session
 * @param params - Session revocation parameters
 * @param params.sessionId - The session ID to revoke
 * @param params.userId - The user ID (for security check)
 * @returns True if successful
 */
export const revokeSession = async ({
    sessionId,
    userId,
}: {
    sessionId: string;
    userId: string;
}) => {
    const session = await getSessionById({ sessionId });
    if (!session) {
        throw errorFactory.createAuthError({
            message: 'Session not found',
            code: 'AUTH.SESSION_NOT_FOUND',
        });
    }

    // Security check: ensure session belongs to user
    if (session.userId !== userId) {
        throw errorFactory.createAuthError({
            message: 'Unauthorized to revoke this session',
            code: 'AUTH.INVALID_CREDENTIALS',
        });
    }

    await deleteSession({ sessionId, userId });
    return true;
};

/**
 * Revoke all sessions for a user except one
 * @param params - Session revocation parameters
 * @param params.userId - The user ID
 * @param params.exceptSessionId - Session ID to preserve (optional)
 * @returns True if successful
 */
export const revokeAllSessions = async ({
    userId,
    exceptSessionId,
}: {
    userId: string;
    exceptSessionId?: string;
}) => {
    await sessionQueries.deleteAllSessionRecordsExcept({ userId, exceptSessionId });
    return true;
};
