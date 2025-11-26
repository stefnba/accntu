import { transactionImportSchemas } from '@/features/transaction-import/schemas/import-record';
import { transactionImportQueries } from '@/features/transaction-import/server/db/queries/import-record';
import { transactionImportFileServices } from '@/features/transaction-import/server/services/import-file';
import { AppErrors } from '@/server/lib/error';
import { createFeatureServices } from '@/server/lib/service';

export const transactionImportServices = createFeatureServices('transactionImport')
    .registerSchema(transactionImportSchemas)
    .registerQueries(transactionImportQueries)
    .registerAllStandard()
    /**
     * Activate a draft import by changing status to pending
     */
    .addService('activate', ({ queries }) => ({
        operation: 'activate a transaction import',
        fn: async (input) => {
            const existing = await queries.getById({ ids: input.ids, userId: input.userId });
            if (!existing) {
                throw AppErrors.resource('NOT_FOUND', {
                    message: 'Transaction import not found',
                });
            }

            if (existing.status !== 'draft') {
                throw AppErrors.operation('UPDATE_FAILED', {
                    layer: 'service',
                    message: 'Can only activate draft imports',
                    details: { importId: input.ids.id },
                });
            }

            const updated = await queries.updateById({
                ids: input.ids,
                data: { status: 'pending' },
                userId: input.userId,
            });

            if (!updated) {
                throw AppErrors.operation('UPDATE_FAILED', {
                    message: 'Failed to activate transaction import',
                });
            }

            return updated;
        },
    }))
    /**
     * Update the import record counts based on the associated files
     */
    .addService('updateCounts', ({ queries }) => ({
        operation: 'update the import record counts based on the associated files',
        fn: async (input) => {
            const files = await transactionImportFileServices.getMany({
                userId: input.userId,
                filters: { importId: input.ids.id },
                pagination: { page: 1, pageSize: 100 },
            });

            const fileCount = files.length;
            const importedFileCount = files.filter((f) => f.status === 'imported').length;
            const totalImportedTransactions = files.reduce(
                (sum: number, f) => sum + (f.importedTransactionCount || 0),
                0
            );

            const updateData = {
                fileCount,
                importedFileCount,
                importedTransactionCount: totalImportedTransactions,
            };

            return await queries.updateById({
                ids: input.ids,
                userId: input.userId,
                data: updateData,
            });
        },
    }))
    .build();
