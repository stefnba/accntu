import { InsertSessionSchema } from '@/server/db/schemas/auth';
import { z } from 'zod';
import * as sessionQueries from '../queries/session';

/**
 * Create a new session
 * @param params - Session creation parameters
 * @param params.userId - The user ID
 * @param params.expiresAt - When the session expires
 * @param params.ipAddress - The IP address (optional)
 * @param params.userAgent - The user agent (optional)
 * @returns The created session
 */
export const createSession = async (params: z.infer<typeof InsertSessionSchema>) => {
    return sessionQueries.createSessionRecord(params);
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
export const getSessionsByUserId = async ({ userId }: { userId: string }) => {
    return sessionQueries.getSessionRecordsByUserId({ userId });
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
 * @returns True if successful
 */
export const deleteSession = async ({ sessionId }: { sessionId: string }) => {
    await sessionQueries.deleteSessionRecord({ sessionId });
    return true;
};
