import { and, eq } from 'drizzle-orm';

import {
    TSplitConfig,
    TSplitParticipant,
    transactionBudgetSchemas,
    transactionBudgetToParticipantSchemas,
} from '@/features/budget/schemas';
import {
    transactionBudgetQueries,
    transactionBudgetToParticipantQueries,
} from '@/features/budget/server/db/queries';
import { db, dbTable } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { createFeatureServices } from '@/server/lib/service/';

// ====================
// Split Calculation Engine
// ====================

/**
 * Calculate budget amount for a transaction and user
 * Applies precedence: Transaction > Bucket > Account > Default (100%)
 */
const calculateTransactionBudget = async ({
    transactionId,
    userId,
}: {
    transactionId: string;
    userId: string;
}) => {
    return await withDbQuery({
        queryFn: async () => {
            // Get transaction details
            const [transactionData] = await db
                .select()
                .from(dbTable.transaction)
                .where(eq(dbTable.transaction.id, transactionId));

            if (!transactionData) {
                throw new Error('Transaction not found');
            }

            // 1. Check for direct transaction splits (highest precedence)
            const transactionSplits = await db
                .select()
                .from(dbTable.participantToTransaction)
                .where(
                    and(
                        eq(dbTable.participantToTransaction.transactionId, transactionId),
                        eq(dbTable.participantToTransaction.isActive, true)
                    )
                );

            if (transactionSplits.length > 0) {
                const splitResult = await calculateSplitAmount({
                    splits: transactionSplits,
                    totalAmount: Number(transactionData.userAmount),
                    userId,
                    source: 'transaction',
                });
                return splitResult;
            }

            // 2. Check for bucket-level splits
            const bucketConnection = await db
                .select()
                .from(dbTable.bucketToTransaction)
                .where(
                    and(
                        eq(dbTable.bucketToTransaction.transactionId, transactionId),
                        eq(dbTable.bucketToTransaction.isActive, true)
                    )
                );

            if (bucketConnection.length > 0) {
                const bucketSplits = await db
                    .select()
                    .from(dbTable.participantToBucket)
                    .where(
                        and(
                            eq(dbTable.participantToBucket.bucketId, bucketConnection[0].bucketId),
                            eq(dbTable.participantToBucket.isActive, true)
                        )
                    );

                if (bucketSplits.length > 0) {
                    const splitResult = await calculateSplitAmount({
                        splits: bucketSplits,
                        totalAmount: Number(transactionData.userAmount),
                        userId,
                        source: 'bucket',
                    });
                    return splitResult;
                }
            }

            // 3. Check for account-level splits
            const accountSplits = await db
                .select()
                .from(dbTable.participantToConnectedBankAccount)
                .where(
                    and(
                        eq(
                            dbTable.participantToConnectedBankAccount.connectedBankAccountId,
                            transactionData.connectedBankAccountId
                        ),
                        eq(dbTable.participantToConnectedBankAccount.isActive, true)
                    )
                );

            if (accountSplits.length > 0) {
                const splitResult = await calculateSplitAmount({
                    splits: accountSplits,
                    totalAmount: Number(transactionData.userAmount),
                    userId,
                    source: 'account',
                });
                return splitResult;
            }

            // 4. Default: User pays 100%
            return {
                budgetAmount: Number(transactionData.userAmount),
                budgetPercentage: 100.0,
                splitSource: 'none' as const,
                participantRecords: [
                    {
                        participantId: userId,
                        name: 'You',
                        email: '',
                        splitConfig: { type: 'percentage', value: 100 },
                        resolvedAmount: Number(transactionData.userAmount),
                        resolvedPercentage: 100.0,
                        isUserParticipant: true,
                    },
                ] as (TSplitParticipant & { isUserParticipant: boolean })[],
            };
        },
        operation: 'calculate transaction budget',
    });
};

/**
 * Calculate split amounts based on participant configurations
 */
const calculateSplitAmount = async ({
    splits,
    totalAmount,
    userId,
    source,
}: {
    splits: any[];
    totalAmount: number;
    userId: string;
    source: 'transaction' | 'bucket' | 'account';
}) => {
    const participantRecords: (TSplitParticipant & { isUserParticipant: boolean })[] = [];
    let userBudgetAmount = 0;
    let userBudgetPercentage = 0;

    // Process each split configuration
    for (const split of splits) {
        const splitConfig = split.splitConfig as TSplitConfig;

        let resolvedAmount = 0;
        let resolvedPercentage = 0;

        switch (splitConfig.type) {
            case 'equal':
                resolvedPercentage = 100 / splits.length;
                resolvedAmount = (totalAmount * resolvedPercentage) / 100;
                break;

            case 'percentage':
                resolvedPercentage = splitConfig.value || 0;
                resolvedAmount = (totalAmount * resolvedPercentage) / 100;
                break;

            case 'amount':
                resolvedAmount = splitConfig.value || 0;
                resolvedPercentage = (resolvedAmount / totalAmount) * 100;
                break;

            case 'share': {
                // Calculate share ratio
                const totalShares = splits.reduce((sum, s) => {
                    const config = s.splitConfig as TSplitConfig;
                    return sum + (config.type === 'share' ? config.value || 1 : 1);
                }, 0);
                const shareValue = splitConfig.value || 1;
                resolvedPercentage = (shareValue / totalShares) * 100;
                resolvedAmount = (totalAmount * resolvedPercentage) / 100;
                break;
            }

            case 'adjustment': {
                // Base calculation + adjustment
                const baseType = splitConfig.baseType || 'equal';
                const basePercentage = baseType === 'equal' ? 100 / splits.length : 0;
                const adjustment = splitConfig.adjustment || 0;
                resolvedAmount = (totalAmount * basePercentage) / 100 + adjustment;
                resolvedPercentage = (resolvedAmount / totalAmount) * 100;
                break;
            }

            default:
                resolvedPercentage = 0;
                resolvedAmount = 0;
        }

        // Apply caps and floors
        if (splitConfig.cap && resolvedAmount > splitConfig.cap) {
            resolvedAmount = splitConfig.cap;
            resolvedPercentage = (resolvedAmount / totalAmount) * 100;
        }
        if (splitConfig.floor && resolvedAmount < splitConfig.floor) {
            resolvedAmount = splitConfig.floor;
            resolvedPercentage = (resolvedAmount / totalAmount) * 100;
        }

        const isUserParticipant = split.participantId === userId;

        participantRecords.push({
            participantId: split.participantId,
            name: 'Participant', // Will need to join with participant table for name
            email: '',
            splitConfig,
            resolvedAmount,
            resolvedPercentage,
            isUserParticipant,
        });

        // Track user's share
        if (isUserParticipant) {
            userBudgetAmount = resolvedAmount;
            userBudgetPercentage = resolvedPercentage;
        }
    }

    // Validate total doesn't exceed 100%
    const totalPercentage = participantRecords.reduce((sum, p) => sum + p.resolvedPercentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
        console.warn(`Split total is ${totalPercentage}%, not 100%`);
    }

    return {
        budgetAmount: userBudgetAmount,
        budgetPercentage: userBudgetPercentage,
        splitSource: source,
        participantRecords,
    };
};

// ====================
// Service Factory
// ====================

export const budgetServices = createFeatureServices
    .registerSchema(transactionBudgetSchemas)
    .registerSchema(transactionBudgetToParticipantSchemas)
    .registerQuery(transactionBudgetQueries)
    .registerQuery(transactionBudgetToParticipantQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new transaction budget
         */
        create: async ({ data, userId }) => {
            return await queries.create({ data, userId });
        },

        /**
         * Get a transaction budget by ID
         */
        getById: async ({ ids, userId }) => {
            return await queries.getById({ ids, userId });
        },

        /**
         * Get many transaction budgets
         */
        getMany: async ({ userId, filters, pagination }) => {
            return await queries.getMany({ userId, filters, pagination });
        },

        /**
         * Update a transaction budget by ID
         */
        updateById: async ({ data, ids, userId }) => {
            return await queries.updateById({ ids, data, userId });
        },

        /**
         * Remove a transaction budget by ID
         */
        removeById: async ({ ids, userId }) => {
            return await queries.removeById({ ids, userId });
        },

        /**
         * Calculate and store budget for a transaction
         */
        calculateAndStore: async ({ transactionId, userId }) => {
            const calculationResult = await calculateTransactionBudget({ transactionId, userId });

            // Check if budget already exists
            const existingBudget = await queries.getByTransactionAndUser({
                transactionId,
                userId,
            });

            let budgetRecord;

            if (existingBudget) {
                // Update existing budget
                budgetRecord = await queries.updateById({
                    ids: { id: existingBudget.id },
                    userId,
                    data: {
                        budgetAmount: calculationResult.budgetAmount.toString(),
                        budgetPercentage: calculationResult.budgetPercentage.toString(),
                        splitSource: calculationResult.splitSource,
                        transactionId,
                        // calculatedAt: new Date(),
                        // isRecalculationNeeded: false,
                    },
                });

                // Remove existing participant records
                await queries.removeParticipantsByBudgetId({
                    transactionBudgetId: existingBudget.id,
                });
            } else {
                // Create new budget
                budgetRecord = await queries.create({
                    data: {
                        transactionId,
                        budgetAmount: calculationResult.budgetAmount.toString(),
                        budgetPercentage: calculationResult.budgetPercentage.toString(),
                        splitSource: calculationResult.splitSource,
                        // isRecalculationNeeded: false,
                    },
                    userId,
                });
            }

            // Create participant records
            const participantRecords = calculationResult.participantRecords.map((record) => ({
                participantId: record.participantId,
                resolvedAmount: record.resolvedAmount.toString(),
                resolvedPercentage: record.resolvedPercentage.toString(),
                splitConfigUsed: record.splitConfig,
                isUserParticipant: record.isUserParticipant,
            }));

            await queries.createParticipants({
                transactionBudgetId: budgetRecord.id,
                participants: participantRecords,
            });

            return budgetRecord;
        },

        /**
         * Mark transaction budgets for recalculation
         */
        markForRecalculation: async ({ transactionId }) => {
            return await queries.markForRecalculation({ transactionId });
        },

        /**
         * Process all pending recalculations
         */
        // processPendingRecalculations: async () => {
        //     const pendingBudgets = await queries.getPendingRecalculation();

        //     const results = [];
        //     for (const budget of pendingBudgets) {
        //         const result = await budgetServices.calculateAndStore({
        //             transactionId: budget.transactionId,
        //             userId: budget.userId,
        //         });
        //         results.push(result);
        //     }

        //     return results;
        // },
    }));
