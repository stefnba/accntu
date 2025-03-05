import { db } from '@/server/db';
import { InsertSessionSchema, SelectSessionSchema, session } from '@/server/db/schemas';
import {
    withDbQuery,
    withDbQueryValidated,
    withDbQueryValidatedNullable,
} from '@/server/lib/handler';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Session queries

/**
 * Create a new session record
 * @param params - The session data
 * @param params.userId - The user ID
 * @param params.expiresAt - When the session expires
 * @param params.ipAddress - The IP address (optional)
 * @param params.userAgent - The user agent (optional)
 * @returns The created session
 */
export const createSessionRecord = async (params: z.infer<typeof InsertSessionSchema>) =>
    withDbQueryValidated({
        operation: 'create session record',
        inputSchema: InsertSessionSchema,
        inputData: params,
        queryFn: (validatedData) =>
            db.insert(session).values({
                id: createId(),
                userId: validatedData.userId,
                expiresAt: validatedData.expiresAt,
                ipAddress: validatedData.ipAddress,
                userAgent: validatedData.userAgent,
                lastActiveAt: new Date(),
            }),
    });

/**
 * Get a session record by ID
 * @param params - The query parameters
 * @param params.sessionId - The ID of the session
 * @returns The session if found, otherwise null
 */
export const getSessionRecordById = async ({ sessionId }: { sessionId: string }) =>
    withDbQueryValidatedNullable({
        operation: 'get session record by id',
        outputSchema: SelectSessionSchema,
        queryFn: async () => {
            const [result] = await db.select().from(session).where(eq(session.id, sessionId));
            return result;
        },
    });

/**
 * Get all session records by user ID
 * @param params - The query parameters
 * @param params.userId - The ID of the user
 * @returns The session records
 */
export const getSessionRecordsByUserId = async ({ userId }: { userId: string }) =>
    withDbQueryValidated({
        operation: 'get session records by user id',
        outputSchema: z.array(SelectSessionSchema),
        queryFn: async () => db.select().from(session).where(eq(session.userId, userId)),
    });

/**
 * Update the last active timestamp for a session
 * @param params - The update parameters
 * @param params.sessionId - The ID of the session
 */
export const updateSessionLastActive = async ({ sessionId }: { sessionId: string }) =>
    withDbQuery({
        operation: 'update session last active',
        queryFn: async () =>
            db.update(session).set({ lastActiveAt: new Date() }).where(eq(session.id, sessionId)),
    });

/**
 * Delete a session record
 * @param params - The delete parameters
 * @param params.sessionId - The ID of the session
 */
export const deleteSessionRecord = async ({ sessionId }: { sessionId: string }) =>
    withDbQuery({
        operation: 'delete session record',
        queryFn: () => db.delete(session).where(eq(session.id, sessionId)),
    });
