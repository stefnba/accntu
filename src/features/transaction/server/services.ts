import { importFileServices } from '@/features/transaction-import/server/services/import-file';
import {
    transactionSchemas,
    TTransactionParseDuplicateCheck,
} from '@/features/transaction/schemas';
import { transactionQueries } from '@/features/transaction/server/db/queries';
import { createFeatureServices } from '@/server/lib/service';
import { InferFeatureType } from '@/server/lib/db';

export const transactionServices = createFeatureServices
    .registerSchema(transactionSchemas)
    .registerQuery(transactionQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new transaction
         */
        create: async (input) => {
            return await queries.create({ data: input.data, userId: input.userId });
        },

        /**
         * Get many transactions with filters and pagination
         */
        getMany: async (input) => {
            return await queries.getMany({
                userId: input.userId,
                filters: input.filters,
                pagination: input.pagination,
            });
        },

        /**
         * Get a transaction by ID
         */
        getById: async (input) => {
            const transaction = await queries.getById({
                ids: input.ids,
                userId: input.userId,
            });

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            return transaction;
        },

        /**
         * Update a transaction by ID
         */
        updateById: async (input) => {
            return await queries.updateById({
                ids: input.ids,
                data: input.data,
                userId: input.userId,
            });
        },

        /**
         * Remove a transaction by ID
         */
        removeById: async (input) => {
            return await queries.removeById({
                ids: input.ids,
                userId: input.userId,
            });
        },
    }));

// Legacy functions for transaction import and other complex operations
/**
 * Get transactions by their keys (for duplicate detection)
 * @param userId - The user ID
 * @param keys - Array of transaction keys
 * @returns The transactions
 */
export const getByKeys = async ({ userId, keys }: { userId: string; keys: string[] }) => {
    const transactions = await transactionQueries.getByKeys({ userId, keys });
    return transactions;
};

/**
 * Get filter options for transaction table
 * @param userId - The user ID
 * @returns The filter options
 */
export const getFilterOptions = async (userId: string) => {
    const filterOptions = await transactionQueries.getFilterOptions(userId);
    return filterOptions;
};

/**
 * Create many transactions
 * @param userId - The user ID
 * @param transactions - Array of transaction data
 * @returns The created transactions
 */
export const createMany = async ({
    userId,
    transactions,
    importFileId,
}: {
    userId: string;
    transactions: Array<TTransactionParseDuplicateCheck>;
    importFileId: string;
}) => {
    const importFile = await importFileServices.getById({
        id: importFileId,
        userId,
    });

    if (!importFile) {
        throw new Error('Import file not found');
    }

    // 1. Add userId and originalTitle to the transactions
    const transactionsToCreate = transactions.map((transaction) => ({
        ...transaction,
        originalTitle: transaction.title,
        userId,
        userAmount: transaction.spendingAmount,
        userCurrency: transaction.spendingCurrency,
        importFileId,
        connectedBankAccountId: importFile.import.connectedBankAccountId,
    }));

    // 2. Add currency conversion

    // 3. Import
    const createdTransactions = await transactionQueries.createMany(transactionsToCreate);
    return createdTransactions;
};

export type TTransaction = InferFeatureType<typeof transactionQueries>;
