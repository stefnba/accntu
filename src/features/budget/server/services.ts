import { eq, and } from 'drizzle-orm';

import { participantToTransaction, participantToBucket, participantToConnectedBankAccount } from '@/features/participant/server/db/schema';
import { bucketToTransaction } from '@/features/bucket/server/db/schema';
import { transaction } from '@/features/transaction/server/db/schema';
import { TTransactionBudgetQuery, TTransactionBudgetToParticipantQuery, TSplitConfig, TSplitParticipant } from '@/features/budget/schemas';
import { transactionBudgetQueries, transactionBudgetToParticipantQueries } from '@/features/budget/server/db/queries';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

// ====================
// Split Calculation Engine
// ====================

/**
 * Calculate budget amount for a transaction and user
 * Applies precedence: Transaction > Bucket > Account > Default (100%)
 */
const calculateTransactionBudget = async ({ 
    transactionId, 
    userId 
}: { 
    transactionId: string; 
    userId: string; 
}) => {
    return await withDbQuery({
        queryFn: async () => {
            // Get transaction details
            const [transactionData] = await db
                .select()
                .from(transaction)
                .where(eq(transaction.id, transactionId));

            if (!transactionData) {
                throw new Error('Transaction not found');
            }

            // 1. Check for direct transaction splits (highest precedence)
            const transactionSplits = await db
                .select()
                .from(participantToTransaction)
                .where(
                    and(
                        eq(participantToTransaction.transactionId, transactionId),
                        eq(participantToTransaction.isActive, true)
                    )
                );

            if (transactionSplits.length > 0) {
                const splitResult = await calculateSplitAmount({
                    splits: transactionSplits,
                    totalAmount: Number(transactionData.userAmount),
                    userId,
                    source: 'transaction'
                });
                return splitResult;
            }

            // 2. Check for bucket-level splits
            const bucketConnection = await db
                .select()
                .from(bucketToTransaction)
                .where(
                    and(
                        eq(bucketToTransaction.transactionId, transactionId),
                        eq(bucketToTransaction.isActive, true)
                    )
                );

            if (bucketConnection.length > 0) {
                const bucketSplits = await db
                    .select()
                    .from(participantToBucket)
                    .where(
                        and(
                            eq(participantToBucket.bucketId, bucketConnection[0].bucketId),
                            eq(participantToBucket.isActive, true)
                        )
                    );

                if (bucketSplits.length > 0) {
                    const splitResult = await calculateSplitAmount({
                        splits: bucketSplits,
                        totalAmount: Number(transactionData.userAmount),
                        userId,
                        source: 'bucket'
                    });
                    return splitResult;
                }
            }

            // 3. Check for account-level splits
            const accountSplits = await db
                .select()
                .from(participantToConnectedBankAccount)
                .where(
                    and(
                        eq(participantToConnectedBankAccount.connectedBankAccountId, transactionData.connectedBankAccountId),
                        eq(participantToConnectedBankAccount.isActive, true)
                    )
                );

            if (accountSplits.length > 0) {
                const splitResult = await calculateSplitAmount({
                    splits: accountSplits,
                    totalAmount: Number(transactionData.userAmount),
                    userId,
                    source: 'account'
                });
                return splitResult;
            }

            // 4. Default: User pays 100%
            return {
                budgetAmount: Number(transactionData.userAmount),
                budgetPercentage: 100.00,
                splitSource: 'none' as const,
                participantRecords: [{
                    participantId: userId,
                    name: 'You',
                    email: '',
                    splitConfig: { type: 'percentage', value: 100 },
                    resolvedAmount: Number(transactionData.userAmount),
                    resolvedPercentage: 100.00,
                    isUserParticipant: true
                }] as (TSplitParticipant & { isUserParticipant: boolean })[]
            };
        },
        operation: 'calculate transaction budget'
    });
};

/**
 * Calculate split amounts based on participant configurations
 */
const calculateSplitAmount = async ({
    splits,
    totalAmount,
    userId,
    source
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

            case 'share':
                // Calculate share ratio
                const totalShares = splits.reduce((sum, s) => {
                    const config = s.splitConfig as TSplitConfig;
                    return sum + (config.type === 'share' ? (config.value || 1) : 1);
                }, 0);
                const shareValue = splitConfig.value || 1;
                resolvedPercentage = (shareValue / totalShares) * 100;
                resolvedAmount = (totalAmount * resolvedPercentage) / 100;
                break;

            case 'adjustment':
                // Base calculation + adjustment
                const baseType = splitConfig.baseType || 'equal';
                const basePercentage = baseType === 'equal' ? (100 / splits.length) : 0;
                const adjustment = splitConfig.adjustment || 0;
                resolvedAmount = ((totalAmount * basePercentage) / 100) + adjustment;
                resolvedPercentage = (resolvedAmount / totalAmount) * 100;
                break;

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
            isUserParticipant
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
        participantRecords
    };
};

// ====================
// Service Functions
// ====================

export const budgetService = {
    /**
     * Get all transaction budgets for a user
     */
    getAll: async ({ userId }: TQuerySelectUserRecords) => {
        const result = await transactionBudgetQueries.getAll({ userId });
        return result;
    },

    /**
     * Get a transaction budget by ID
     */
    getById: async ({ id, userId }: TQuerySelectUserRecordById) => {
        const result = await transactionBudgetQueries.getById({ id, userId });
        return result;
    },

    /**
     * Calculate and store budget for a transaction
     */
    calculateAndStore: async ({ transactionId, userId }: { transactionId: string; userId: string }) => {
        const calculationResult = await calculateTransactionBudget({ transactionId, userId });

        // Check if budget already exists
        const existingBudget = await transactionBudgetQueries.getByTransactionAndUser({ 
            transactionId, 
            userId 
        });

        let budgetRecord;

        if (existingBudget) {
            // Update existing budget
            budgetRecord = await transactionBudgetQueries.update({
                id: existingBudget.id,
                userId,
                data: {
                    budgetAmount: calculationResult.budgetAmount,
                    budgetPercentage: calculationResult.budgetPercentage,
                    splitSource: calculationResult.splitSource,
                    calculatedAt: new Date(),
                    isRecalculationNeeded: false
                }
            });

            // Remove existing participant records
            await transactionBudgetToParticipantQueries.removeParticipantsByBudgetId({
                transactionBudgetId: existingBudget.id
            });
        } else {
            // Create new budget
            budgetRecord = await transactionBudgetQueries.create({
                data: {
                    transactionId,
                    budgetAmount: calculationResult.budgetAmount,
                    budgetPercentage: calculationResult.budgetPercentage,
                    splitSource: calculationResult.splitSource,
                    isRecalculationNeeded: false
                },
                userId
            });
        }

        // Create participant records
        const participantRecords = calculationResult.participantRecords.map(record => ({
            transactionBudgetId: budgetRecord.id,
            participantId: record.participantId,
            resolvedAmount: record.resolvedAmount,
            resolvedPercentage: record.resolvedPercentage,
            splitConfigUsed: record.splitConfig,
            isUserParticipant: record.isUserParticipant
        }));

        await transactionBudgetToParticipantQueries.createParticipants({
            participants: participantRecords
        });

        return budgetRecord;
    },

    /**
     * Mark transaction budgets for recalculation
     */
    markForRecalculation: async ({ transactionId }: { transactionId: string }) => {
        return await transactionBudgetQueries.markForRecalculation({ transactionId });
    },

    /**
     * Process all pending recalculations
     */
    processPendingRecalculations: async () => {
        const pendingBudgets = await transactionBudgetQueries.getPendingRecalculation();
        
        const results = [];
        for (const budget of pendingBudgets) {
            const result = await budgetService.calculateAndStore({
                transactionId: budget.transactionId,
                userId: budget.userId
            });
            results.push(result);
        }
        
        return results;
    },

    /**
     * Create a transaction budget
     */
    create: async ({ data, userId }: TQueryInsertUserRecord<TTransactionBudgetQuery['insert']>) => {
        return await transactionBudgetQueries.create({ data, userId });
    },

    /**
     * Update a transaction budget
     */
    update: async ({ id, userId, data }: TQueryUpdateUserRecord<TTransactionBudgetQuery['update']>) => {
        const updatedBudget = await transactionBudgetQueries.update({ id, userId, data });

        if (!updatedBudget) {
            throw new Error('Transaction budget not found or you do not have permission to update it');
        }

        return updatedBudget;
    },

    /**
     * Delete a transaction budget
     */
    remove: async ({ id, userId }: TQueryDeleteUserRecord) => {
        const deletedBudget = await transactionBudgetQueries.remove({ id, userId });

        if (!deletedBudget) {
            throw new Error('Transaction budget not found or you do not have permission to delete it');
        }

        return { id };
    },
};