import { participantSchemas } from '@/features/participant/schemas';
import { db, dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';
import { and, eq } from 'drizzle-orm';

export const participantQueries = createFeatureQueries
    .registerSchema(participantSchemas)
    /**
     * Create a participant
     */
    .addQuery('create', {
        operation: 'create participant',
        fn: async ({ data, userId }) => {
            const [result] = await db
                .insert(dbTable.participant)
                .values({ ...data, userId })
                .returning();
            return result || null;
        },
    })
    /**
     * Get many participants
     */
    .addQuery('getMany', {
        operation: 'get participants with filters',
        fn: async ({ userId, filters, pagination }) => {
            const conditions = [
                eq(dbTable.participant.userId, userId),
                eq(dbTable.participant.isActive, true),
            ];

            if (filters?.search) {
                conditions.push(eq(dbTable.participant.name, filters.search));
            }

            return await db
                .select()
                .from(dbTable.participant)
                .where(and(...conditions))
                .limit(pagination?.pageSize || 10)
                .offset(((pagination?.page || 1) - 1) * (pagination?.pageSize || 10));
        },
    })
    /**
     * Get a participant by ID
     */
    .addQuery('getById', {
        operation: 'get participant by ID',
        fn: async ({ ids, userId }) => {
            const [result] = await db
                .select()
                .from(dbTable.participant)
                .where(and(eq(dbTable.participant.id, ids.id), eq(dbTable.participant.userId, userId)))
                .limit(1);
            return result || null;
        },
    })
    /**
     * Update a participant by ID
     */
    .addQuery('updateById', {
        operation: 'update participant',
        fn: async ({ ids, data, userId }) => {
            const [result] = await db
                .update(dbTable.participant)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(dbTable.participant.id, ids.id), eq(dbTable.participant.userId, userId)))
                .returning();
            return result || null;
        },
    })
    /**
     * Remove a participant by ID
     */
    .addQuery('removeById', {
        operation: 'remove participant',
        fn: async ({ ids, userId }) => {
            const [result] = await db
                .update(dbTable.participant)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(dbTable.participant.id, ids.id), eq(dbTable.participant.userId, userId)))
                .returning();
            return result || null;
        },
    });

export type TParticipant = InferFeatureType<typeof participantQueries>;
