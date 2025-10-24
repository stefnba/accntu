import { importServices } from '@/features/transaction-import/server/services';
import {
    transactionSchemas,
    TTransactionParseDuplicateCheck,
} from '@/features/transaction/schemas';
import {
    createMany as createManyQuery,
    getFilterOptions as getFilterOptionsQuery,
    transactionQueries,
} from '@/features/transaction/server/db/queries';
import { InferFeatureType } from '@/server/lib/db';
import { createFeatureServices } from '@/server/lib/service';

export const transactionServices = createFeatureServices('transaction')
    .registerSchemas(transactionSchemas)
    .registerQueries(transactionQueries)
    .registerCoreServices()
    .build();

/**
 * Get filter options for transaction table
 * @param userId - The user ID
 * @returns The filter options
 */
export const getFilterOptions = async (userId: string) => {
    const filterOptions = await getFilterOptionsQuery(userId);
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
    const importFile = await importServices.importFile.getById({
        ids: { id: importFileId },
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
    const createdTransactions = await createManyQuery(transactionsToCreate);
    return createdTransactions;
};

export type TTransaction = InferFeatureType<typeof transactionQueries>;
