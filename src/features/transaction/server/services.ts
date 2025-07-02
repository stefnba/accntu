import {
    TTransactionFilterOptions,
    TTransactionPagination,
    TTransactionParseSchema,
    TTransactionQuery,
    TTransactionService,
} from '@/features/transaction/schemas';
import { transactionQueries } from '@/features/transaction/server/db/queries';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

/**
 * Create a new transaction
 * @param data - The transaction data
 * @param userId - The user ID
 * @returns The created transaction
 */
const create = async ({
    data,
    userId,
    connectedBankAccountId,
    importFileId,
}: TQueryInsertUserRecord<Array<TTransactionParseSchema>> &
    Pick<TTransactionQuery['insert'], 'connectedBankAccountId' | 'importFileId'>) => {
    // Add the connectedBankAccountId and importFileId to the data
    // todo: add the userAmount, userCurrency, spendingAmount, spendingCurrency, accountAmount, accountCurrency, balance
    const transactions = data.map((transaction) => ({
        ...transaction,
        connectedBankAccountId,
        importFileId,
        userId,
        originalTitle: transaction.title,
        userAmount: '0',
        userCurrency: 'USD',
        spendingAmount: '0',
        spendingCurrency: 'USD',
        accountAmount: '0',
        accountCurrency: 'USD',
        balance: '0',
    }));

    const transaction = await transactionQueries.createMany(transactions);

    return transaction;
};

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
 * Checks a list of parsed transactions for duplicates against existing records.
 * @param userId - The user ID.
 * @param transactions - An array of parsed transaction objects to check.
 * @returns The same array of transactions, each annotated with `isDuplicate` and `existingTransactionId`.
 */
const checkForDuplicates = async ({
    userId,
    transactions,
}: {
    userId: string;
    transactions: TTransactionParseSchema[];
}) => {
    if (transactions.length === 0) {
        return [];
    }

    const keys = transactions.map((t) => t.key);
    const existing = await transactionQueries.getDuplicates({ userId, keys });

    const existingKeysMap = new Map(existing.map((t) => [t.key, t.id]));

    return transactions.map((transaction) => ({
        ...transaction,
        isDuplicate: existingKeysMap.has(transaction.key),
        existingTransactionId: existingKeysMap.get(transaction.key) || null,
    }));
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
}: {
    userId: string;
    transactions: Array<{
        amount: number;
        description: string;
        date: Date;
        category?: string | null;
        reference?: string | null;
        key: string;
        bankAccountId: string;
        importFileId: string;
    }>;
}) => {
    const transactionsToCreate = transactions.map((transaction) => ({
        title: transaction.description,
        description: transaction.description,
        originalTitle: transaction.description,
        date: transaction.date.toISOString().split('T')[0],
        type: transaction.amount > 0 ? ('credit' as const) : ('debit' as const),
        spendingAmount: Math.abs(transaction.amount).toString(),
        spendingCurrency: 'USD',
        accountAmount: Math.abs(transaction.amount).toString(),
        accountCurrency: 'USD',
        userAmount: Math.abs(transaction.amount).toString(),
        userCurrency: 'USD',
        balance: '0',
        key: transaction.key,
        reference: transaction.reference,
        connectedBankAccountId: transaction.bankAccountId,
        importFileId: transaction.importFileId,
        userId,
    }));

    const createdTransactions = await transactionQueries.createMany(transactionsToCreate);
    return createdTransactions;
};

export const transactionServices = {
    create,
    update,
    getById,
    getAll,
    remove,
    getFilterOptions,
    getByKeys,
    createMany,
    checkForDuplicates,
};
