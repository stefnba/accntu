import { importServices } from '@/features/transaction-import/server/services';
import { transactionSchemas } from '@/features/transaction/schemas';
import { transactionQueries } from '@/features/transaction/server/db/queries';
import { AppErrors } from '@/server/lib/error';
import { createFeatureServices } from '@/server/lib/service';

export const transactionServices = createFeatureServices('transaction')
    .registerSchema(transactionSchemas)
    .registerQueries(transactionQueries)
    .registerAllStandard()
    .addService('createManyFromImport', ({ queries }) => ({
        operation: 'create many transactions',
        onNull: 'throw',
        fn: async ({ userId, data }) => {
            const importFile = await importServices.importFile.getById({
                ids: { id: data.importFileId },
                userId,
            });

            if (!importFile) {
                throw AppErrors.resource('NOT_FOUND', {
                    layer: 'service',
                    message: 'Import file not found',
                    details: { importFileId: data.importFileId },
                });
            }

            // 1. Add userId and originalTitle to the transactions
            const transactionsToCreate = data.transactions.map((transaction) => ({
                ...transaction,
                originalTitle: transaction.title,
                userId,
                userAmount: transaction.spendingAmount,
                userCurrency: transaction.spendingCurrency,
                importFileId: data.importFileId,
                connectedBankAccountId: importFile.import.connectedBankAccountId,
            }));

            // 2. Add currency conversion

            // 3. Import
            const createdTransactions = await queries.createMany({
                data: transactionsToCreate,
                userId,
            });
            return createdTransactions;
        },
    }))
    /**
     * Get filter options for transaction table
     * @param userId - The user ID
     * @returns The filter options
     */
    .addService('getFilterOptions', ({ queries }) => ({
        operation: 'get filter options',
        onNull: 'return',
        fn: async ({ userId }) => {
            return await queries.getFilterOptions({ userId });
        },
    }))
    .build();
