import { and, eq } from 'drizzle-orm';

import {
    transactionBudgetSchemas,
    transactionBudgetToParticipantSchemas,
} from '@/features/budget/schemas';
import {
    transactionBudget,
    transactionBudgetToParticipant,
} from '@/features/budget/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const transactionBudgetQueries = createFeatureQueries('transaction-budget')
    .registerSchema(transactionBudgetSchemas)
    /**
     * Get all transaction budgets for a user
     */
    .addQuery('getMany', {
        operation: 'get transaction budgets by user ID',
        fn: async ({ userId, filters, pagination }) => {
            let whereConditions = and(
                eq(transactionBudget.userId, userId),
                eq(transactionBudget.isActive, true)
            );

            // Apply filters
            if (filters?.transactionId) {
                whereConditions = and(
                    whereConditions,
                    eq(transactionBudget.transactionId, filters.transactionId)
                );
            }

            if (filters?.splitSource) {
                whereConditions = and(
                    whereConditions,
                    eq(transactionBudget.splitSource, filters.splitSource)
                );
            }

            return await db.query.transactionBudget.findMany({
                where: whereConditions,
                with: {
                    transaction: true,
                    participants: {
                        with: {
                            participant: true,
                        },
                    },
                },
            });
        },
    })
    /**
     * Create a transaction budget
     */
    .addQuery('create', {
        fn: async ({ data, userId }) => {
            const [newBudget] = await db
                .insert(transactionBudget)
                .values({ ...data, userId })
                .returning();
            return newBudget;
        },
        operation: 'create transaction budget',
    })
    /**
     * Get a transaction budget by ID
     */
    .addQuery('getById', {
        operation: 'get transaction budget by ID',
        fn: async ({ ids, userId }) => {
            const [result] = await db
                .select()
                .from(transactionBudget)
                .where(
                    and(
                        eq(transactionBudget.id, ids.id),
                        eq(transactionBudget.userId, userId),
                        eq(transactionBudget.isActive, true)
                    )
                )
                .limit(1);
            return result || null;
        },
    })
    /**
     * Soft delete a transaction budget
     */
    .addQuery('removeById', {
        operation: 'delete transaction budget',
        fn: async ({ ids, userId }) => {
            const [deleted] = await db
                .update(transactionBudget)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(transactionBudget.id, ids.id), eq(transactionBudget.userId, userId)))
                .returning();
            return deleted || null;
        },
    })
    /**
     * Update a transaction budget
     */
    .addQuery('updateById', {
        operation: 'update transaction budget',
        fn: async ({ ids, data, userId }) => {
            const [updated] = await db
                .update(transactionBudget)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(transactionBudget.id, ids.id), eq(transactionBudget.userId, userId)))
                .returning();
            return updated || null;
        },
    })
    /**
     * Get transaction budget by transaction ID and user ID
     */
    .addQuery('getByTransactionAndUser', {
        operation: 'get transaction budget by transaction and user',
        fn: async ({ transactionId, userId }) => {
            const [result] = await db
                .select()
                .from(transactionBudget)
                .where(
                    and(
                        eq(transactionBudget.transactionId, transactionId),
                        eq(transactionBudget.userId, userId),
                        eq(transactionBudget.isActive, true)
                    )
                );
            return result || null;
        },
    })
    /**
     * Get all transaction budgets that need recalculation
     */
    .addQuery('getPendingRecalculation', {
        operation: 'get transaction budgets needing recalculation',
        fn: async () => {
            return await db
                .select()
                .from(transactionBudget)
                .where(
                    and(
                        eq(transactionBudget.isRecalculationNeeded, true),
                        eq(transactionBudget.isActive, true)
                    )
                );
        },
    })
    /**
     * Calculate and store budget for a transaction
     */
    .addQuery('calculateAndStore', {
        operation: 'calculate and store transaction budget',
        fn: async ({ transactionId, userId }) => {
            // This will be implemented in the service layer
            // The query layer just provides data access
            throw new Error('calculateAndStore should be called from service layer');
        },
    })
    /**
     * Mark transaction budgets for recalculation
     */
    .addQuery('markForRecalculation', {
        operation: 'mark transaction budgets for recalculation',
        fn: async ({ transactionId }) => {
            return await db
                .update(transactionBudget)
                .set({
                    isRecalculationNeeded: true,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(transactionBudget.transactionId, transactionId),
                        eq(transactionBudget.isActive, true)
                    )
                )
                .returning();
        },
    });

export const transactionBudgetToParticipantQueries = createFeatureQueries('transaction-budget-to-participant')
    .registerSchema(transactionBudgetToParticipantSchemas)
    /**
     * Get all participants for a transaction budget
     */
    .addQuery('getParticipantsByBudgetId', {
        operation: 'get participants by budget ID',
        fn: async ({ transactionBudgetId }) => {
            return await db
                .select()
                .from(transactionBudgetToParticipant)
                .where(eq(transactionBudgetToParticipant.transactionBudgetId, transactionBudgetId));
        },
    })
    /**
     * Get all budget participants for a participant
     */
    .addQuery('getBudgetsByParticipantId', {
        operation: 'get budgets by participant ID',
        fn: async ({ participantId }) => {
            return await db
                .select()
                .from(transactionBudgetToParticipant)
                .where(eq(transactionBudgetToParticipant.participantId, participantId));
        },
    })
    /**
     * Create multiple budget participants
     */
    .addQuery('createParticipants', {
        operation: 'create budget participants',
        fn: async ({ transactionBudgetId, participants }) => {
            if (!participants || participants.length === 0) {
                return [];
            }

            const participantsWithBudgetId = participants.map((p) => ({
                ...p,
                transactionBudgetId,
            }));

            return await db
                .insert(transactionBudgetToParticipant)
                .values(participantsWithBudgetId)
                .returning();
        },
    })
    /**
     * Remove all participants for a budget
     */
    .addQuery('removeParticipantsByBudgetId', {
        operation: 'remove participants by budget ID',
        fn: async ({ transactionBudgetId }) => {
            return await db
                .delete(transactionBudgetToParticipant)
                .where(eq(transactionBudgetToParticipant.transactionBudgetId, transactionBudgetId))
                .returning();
        },
    });

export type TTransactionBudget = InferFeatureType<typeof transactionBudgetQueries>;
export type TTransactionBudgetToParticipant = InferFeatureType<
    typeof transactionBudgetToParticipantQueries
>;
