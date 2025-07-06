import { importFileServices } from '@/features/transaction-import/server/services/import-file';
import {
    TTransactionFilterOptions,
    TTransactionPagination,
    TTransactionParseDuplicateCheck,
    TTransactionService,
} from '@/features/transaction/schemas';
import { transactionQueries } from '@/features/transaction/server/db/queries';
import {
    TQueryDeleteUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

/**
 * Update a transaction
 * @param data - The transaction data
 * @param userId - The user ID
 * @returns The updated transaction
 */
const update = async ({
    data,
    id,
    userId,
}: TQueryUpdateUserRecord<TTransactionService['update']>) => {
    const transaction = await transactionQueries.update({
        id,
        data,
        userId,
    });

    return transaction;
};

/**
 * Get a transaction by ID
 * @param id - The transaction ID
 * @param userId - The user ID
 * @returns The transaction
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) => {
    const transaction = await transactionQueries.getById({
        id,
        userId,
    });

    // TODO: replace with error factory
    if (!transaction) {
        throw new Error('Transaction not found');
    }

    return transaction;
};

/**
 * Get all transactions
 * @param userId - The user ID
 * @param filters - The filters
 * @returns The transactions
 */
const getAll = async ({
    userId,
    filters,
    pagination,
}: TQuerySelectUserRecords<TTransactionFilterOptions> & { pagination: TTransactionPagination }) => {
    const transactions = await transactionQueries.getAll({
        userId,
        filters,
        pagination,
    });

    return transactions;
};

/**
 * Get filter options for transaction table
 * @param userId - The user ID
 * @returns The filter options
 */
const getFilterOptions = async (userId: string) => {
    const filterOptions = await transactionQueries.getFilterOptions(userId);
    return filterOptions;
};
/**
 * Delete a transaction
 * @param id - The transaction ID
 * @param userId - The user ID
 * @returns The removed transaction
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) => {
    const transaction = await transactionQueries.remove({
        id,
        userId,
    });

    return transaction;
};

/**
 * Get transactions by their keys (for duplicate detection)
 * @param userId - The user ID
 * @param keys - Array of transaction keys
 * @returns The transactions
 */
const getByKeys = async ({ userId, keys }: { userId: string; keys: string[] }) => {
    const transactions = await transactionQueries.getByKeys({ userId, keys });
    return transactions;
};

/**
 * Create many transactions
 * @param userId - The user ID
 * @param transactions - Array of transaction data
 * @returns The created transactions
 */
const createMany = async ({
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
        originalTitle: transaction.title,
        userId,
        userAmount: transaction.spendingAmount,
        userCurrency: transaction.spendingCurrency,
        importFileId,
        connectedBankAccountId: importFile.import.connectedBankAccountId,
        ...transaction,
    }));

    // 2. Add currency conversion

    // 3. Import
    const createdTransactions = await transactionQueries.createMany(transactionsToCreate);
    return createdTransactions;
};

export const transactionServices = {
    update,
    getById,
    getAll,
    remove,
    getFilterOptions,
    getByKeys,
    createMany,
};

export type TTransactionServicesResponse = {
    getAll: Awaited<ReturnType<typeof getAll>>;
    getById: Awaited<ReturnType<typeof getById>>;
    getFilterOptions: Awaited<ReturnType<typeof getFilterOptions>>;
    remove: Awaited<ReturnType<typeof remove>>;
    getByKeys: Awaited<ReturnType<typeof getByKeys>>;
    createMany: Awaited<ReturnType<typeof createMany>>;
};
