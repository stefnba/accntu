import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFileQueries } from '@/features/transaction-import/server/db/queries/import-file';
import { createFeatureServices } from '@/server/lib/service';

export const transactionImportFileServices = createFeatureServices
    .registerSchema(transactionImportFileSchemas)
    .registerQuery(transactionImportFileQueries)
    .defineServices(({ queries }) => ({
        /**
         * Get many transaction import files
         */
        getMany: async (input) => {
            return await queries.getMany(input);
        },
        /**
         * Get a transaction import file by id
         */
        getById: async (input) => {
            const result = await queries.getById(input);
            if (!result) {
                throw new Error('Transaction import file not found');
            }
            return result;
        },
        /**
         * Create a new transaction import file
         */
        create: async (input) => {
            // Note: Import validation can be handled at the database level with foreign key constraints
            return await queries.create(input);
        },
        /**
         * Update a transaction import file by id
         */
        updateById: async (input) => {
            const result = await queries.updateById(input);
            if (!result) {
                throw new Error('Failed to update transaction import file');
            }
            return result;
        },
        /**
         * Remove a transaction import file by id
         */
        removeById: async (input) => {
            return await queries.removeById(input);
        },
    }));