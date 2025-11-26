import { and, eq } from 'drizzle-orm';

import {
    transactionBudgetSchemas,
    transactionBudgetToParticipantSchemas,
} from '@/features/budget/schemas';
import {
    transactionBudgetTableConfig,
    transactionBudgetToParticipantTableConfig,
} from '@/features/budget/server/db/config';
import { transactionBudget } from '@/features/budget/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const transactionBudgetQueries = createFeatureQueries(
    'transaction-budget',
    transactionBudgetTableConfig
)
    .registerSchema(transactionBudgetSchemas)
    .registerAllStandard()
    /**
     * Get all transaction budgets for a user
     */
    .addQuery('getMany', {
        operation: 'get transaction budgets by user ID',
        fn: async ({ userId, filters }) => {
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
    .build();

export const transactionBudgetToParticipantQueries = createFeatureQueries(
    'transaction-budget-to-participant',
    transactionBudgetToParticipantTableConfig
)
    .registerSchema(transactionBudgetToParticipantSchemas)
    .build();
// /**
//  * Get all participants for a transaction budget
//  */
// .addQuery('getParticipantsByBudgetId', {
//     operation: 'get participants by budget ID',
//     fn: async ({ transactionBudgetId }) => {
//         return await db
//             .select()
//             .from(transactionBudgetToParticipant)
//             .where(eq(transactionBudgetToParticipant.transactionBudgetId, transactionBudgetId));
//     },
// })
// /**
//  * Get all budget participants for a participant
//  */
// .addQuery('getBudgetsByParticipantId', {
//     operation: 'get budgets by participant ID',
//     fn: async ({ participantId }) => {
//         return await db
//             .select()
//             .from(transactionBudgetToParticipant)
//             .where(eq(transactionBudgetToParticipant.participantId, participantId));
//     },
// })

export type TTransactionBudget = InferFeatureType<typeof transactionBudgetQueries>;
export type TTransactionBudgetToParticipant = InferFeatureType<
    typeof transactionBudgetToParticipantQueries
>;
