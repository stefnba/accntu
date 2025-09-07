import { transactionImportSchemas } from '@/features/transaction-import/schemas/import-record';
import { transactionImportQueries } from '@/features/transaction-import/server/db/queries/import-record';
import { transactionImportFileQueries } from '@/features/transaction-import/server/db/queries/import-file';
import { createFeatureServices } from '@/server/lib/service';

export const transactionImportServices = createFeatureServices
    .registerSchema(transactionImportSchemas)
    .registerQuery(transactionImportQueries)
    .defineServices(({ queries }) => ({
        /**
         * Get many transaction imports
         */
        getMany: async (input) => {
            return await queries.getMany(input);
        },
        /**
         * Get a transaction import by id
         */
        getById: async (input) => {
            const result = await queries.getById(input);
            if (!result) {
                throw new Error('Transaction import not found');
            }
            return result;
        },
        /**
         * Create a new transaction import
         */
        create: async (input) => {
            return await queries.create(input);
        },
        /**
         * Update a transaction import by id
         */
        updateById: async (input) => {
            const result = await queries.updateById(input);
            if (!result) {
                throw new Error('Failed to update transaction import');
            }
            return result;
        },
        /**
         * Remove a transaction import by id
         */
        removeById: async (input) => {
            return await queries.removeById(input);
        },
        /**
         * Activate a draft import by changing status to pending
         */
        activate: async ({ ids, userId }: { ids: { id: string }; userId: string }) => {
            const existing = await queries.getById({ ids, userId });
            if (!existing) {
                throw new Error('Transaction import not found');
            }

            if (existing.status !== 'draft') {
                throw new Error('Can only activate draft imports');
            }

            const updated = await queries.updateById({
                ids,
                data: { status: 'pending' },
                userId,
            });

            if (!updated) {
                throw new Error('Failed to activate transaction import');
            }

            return updated;
        },
        /**
         * Update the import record counts based on the associated files
         */
        updateCounts: async ({ ids, userId }: { ids: { id: string }; userId: string }) => {
            const files = await transactionImportFileQueries.getMany({ 
                userId, 
                filters: { importId: ids.id },
                pagination: { page: 1, pageSize: 100 }
            });

            const fileCount = files.length;
            const importedFileCount = files.filter((f: any) => f.status === 'imported').length;
            const totalImportedTransactions = files.reduce(
                (sum: number, f: any) => sum + (f.importedTransactionCount || 0),
                0
            );

            const updateData = {
                fileCount,
                importedFileCount,
                importedTransactionCount: totalImportedTransactions,
            };

            return await queries.updateById({ ids, userId, data: updateData });
        },
    }));