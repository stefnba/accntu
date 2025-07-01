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

export const transactionServices = {
    create,
    update,
    getById,
    getAll,
    remove,
    getFilterOptions,
};
