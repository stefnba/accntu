import { and, eq } from 'drizzle-orm';

import { TTransactionBudgetQuery, TTransactionBudgetToParticipantQuery } from '@/features/budget/schemas';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db, dbTable } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

/**
 * Get all transaction budgets for a user
 * @param userId - The ID of the user
 * @returns The transaction budgets for the user
 */
const getAll = async ({
    userId,
}: TQuerySelectUserRecords): Promise<TTransactionBudgetQuery['select'][]> =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(dbTable.transactionBudget)
                .where(
                    and(eq(dbTable.transactionBudget.userId, userId), eq(dbTable.transactionBudget.isActive, true))
                ),
        operation: 'list all transaction budgets for a user',
    });

/**
 * Get a transaction budget by ID
 * @param id - The ID of the transaction budget
 * @param userId - The user ID
 * @returns The transaction budget
 */
const getById = ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(dbTable.transactionBudget)
                .where(and(eq(dbTable.transactionBudget.id, id), eq(dbTable.transactionBudget.userId, userId)));
            return result;
        },
        operation: 'get transaction budget by ID',
        allowNull: true,
    });

/**
 * Get transaction budget by transaction ID and user ID
 * @param transactionId - The transaction ID
 * @param userId - The user ID
 * @returns The transaction budget
 */
const getByTransactionAndUser = async ({ 
    transactionId, 
    userId 
}: { 
    transactionId: string; 
    userId: string; 
}) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(dbTable.transactionBudget)
                .where(
                    and(
                        eq(dbTable.transactionBudget.transactionId, transactionId),
                        eq(dbTable.transactionBudget.userId, userId),
                        eq(dbTable.transactionBudget.isActive, true)
                    )
                );
            return result;
        },
        operation: 'get transaction budget by transaction and user',
        allowNull: true,
    });

/**
 * Get all transaction budgets that need recalculation
 * @returns Transaction budgets needing recalculation
 */
const getPendingRecalculation = async () =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(dbTable.transactionBudget)
                .where(
                    and(
                        eq(dbTable.transactionBudget.isRecalculationNeeded, true),
                        eq(dbTable.transactionBudget.isActive, true)
                    )
                ),
        operation: 'get transaction budgets needing recalculation',
    });

/**
 * Create a new transaction budget
 * @param data - The data to create the transaction budget with
 * @param userId - The user ID
 * @returns The created transaction budget
 */
const create = ({ data, userId }: TQueryInsertUserRecord<TTransactionBudgetQuery['insert']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(dbTable.transactionBudget)
                .values({ ...data, userId })
                .returning();
            return result;
        },
        operation: 'create transaction budget',
    });

/**
 * Update a transaction budget
 * @param id - The ID of the transaction budget to update
 * @param userId - The user ID
 * @param data - The data to update the transaction budget with
 * @returns The updated transaction budget
 */
const update = ({ id, userId, data }: TQueryUpdateUserRecord<TTransactionBudgetQuery['update']>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(dbTable.transactionBudget)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(dbTable.transactionBudget.id, id), eq(dbTable.transactionBudget.userId, userId)))
                .returning();
            return result;
        },
        operation: 'update transaction budget',
    });

/**
 * Mark transaction budget for recalculation
 * @param transactionId - The transaction ID
 * @returns Updated transaction budgets
 */
const markForRecalculation = async ({ transactionId }: { transactionId: string }) =>
    withDbQuery({
        queryFn: async () => {
            return await db
                .update(dbTable.transactionBudget)
                .set({ 
                    isRecalculationNeeded: true,
                    updatedAt: new Date() 
                })
                .where(
                    and(
                        eq(dbTable.transactionBudget.transactionId, transactionId),
                        eq(dbTable.transactionBudget.isActive, true)
                    )
                )
                .returning();
        },
        operation: 'mark transaction budget for recalculation',
    });

/**
 * Remove a transaction budget
 * @param id - The ID of the transaction budget to remove
 * @param userId - The user ID
 * @returns The removed transaction budget
 */
const remove = ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(dbTable.transactionBudget)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(dbTable.transactionBudget.id, id), eq(dbTable.transactionBudget.userId, userId)))
                .returning();

            return result;
        },
        operation: 'remove transaction budget',
    });

// ====================
// TransactionBudgetToParticipant Queries
// ====================

/**
 * Get all participants for a transaction budget
 * @param transactionBudgetId - The transaction budget ID
 * @returns Participants for the budget
 */
const getParticipantsByBudgetId = async ({ transactionBudgetId }: { transactionBudgetId: string }) =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(dbTable.transactionBudgetToParticipant)
                .where(eq(dbTable.transactionBudgetToParticipant.transactionBudgetId, transactionBudgetId)),
        operation: 'get participants by budget ID',
    });

/**
 * Get all budget participants for a participant
 * @param participantId - The participant ID
 * @returns Budget participants for the participant
 */
const getBudgetsByParticipantId = async ({ participantId }: { participantId: string }) =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(dbTable.transactionBudgetToParticipant)
                .where(eq(dbTable.transactionBudgetToParticipant.participantId, participantId)),
        operation: 'get budgets by participant ID',
    });

/**
 * Create multiple budget participants
 * @param participants - Array of participant data
 * @returns Created participants
 */
const createParticipants = async ({ 
    participants 
}: { 
    participants: TTransactionBudgetToParticipantQuery['insert'][] 
}) =>
    withDbQuery({
        queryFn: async () => {
            return await db
                .insert(dbTable.transactionBudgetToParticipant)
                .values(participants)
                .returning();
        },
        operation: 'create budget participants',
    });

/**
 * Remove all participants for a budget
 * @param transactionBudgetId - The transaction budget ID
 * @returns Removed participants
 */
const removeParticipantsByBudgetId = async ({ transactionBudgetId }: { transactionBudgetId: string }) =>
    withDbQuery({
        queryFn: async () => {
            return await db
                .delete(dbTable.transactionBudgetToParticipant)
                .where(eq(dbTable.transactionBudgetToParticipant.transactionBudgetId, transactionBudgetId))
                .returning();
        },
        operation: 'remove participants by budget ID',
    });

export const transactionBudgetQueries = {
    getById,
    getByTransactionAndUser,
    getPendingRecalculation,
    create,
    update,
    markForRecalculation,
    remove,
    getAll,
};

export const transactionBudgetToParticipantQueries = {
    getParticipantsByBudgetId,
    getBudgetsByParticipantId,
    createParticipants,
    removeParticipantsByBudgetId,
};