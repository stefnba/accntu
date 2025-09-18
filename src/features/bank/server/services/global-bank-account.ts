import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { bankQueries } from '@/features/bank/server/db/queries';
import { transactionSchemas } from '@/features/transaction/schemas';
import { DuckDBTransactionTransformSingleton } from '@/lib/duckdb/singleton';
import { localUploadService } from '@/lib/upload/local/service';

import { createFeatureServices } from '@/server/lib/service';

export const globalBankAccountServices = createFeatureServices
    .registerSchema(globalBankAccountSchemas)
    .registerQuery(bankQueries.globalBankAccount)
    .defineServices(({ queries }) => ({
        create: async (input) => {
            return await queries.create(input);
        },
        /**
         * Get a global bank account by id
         */
        getById: async (input) => {
            return await queries.getById(input);
        },
        /**
         * Get many global bank accounts
         */
        getMany: async (input) => {
            return await queries.getMany(input);
        },
        /**
         * Update a global bank account by id
         */
        updateById: async (input) => {
            return await queries.updateById(input);
        },
        /**
         * Remove a global bank account by id
         */
        removeById: async (input) => {
            return await queries.removeById(input);
        },
        /**
         * Test a global bank account transformation query.
         *
         * This function will save the sample data to disk, transform the data, and return the result.
         *
         * The sample data is deleted from disk after the transformation is complete.
         *
         * @param id - The id of the global bank account
         * @param data - The data to test the global bank account transformation query
         * @returns The result of the global bank account transformation query
         */
        testTransform: async ({ globalBankAccountId }) => {
            if (!globalBankAccountId) {
                throw new Error('Global bank account id is required');
            }

            const globalBankAccount = await queries.getById({
                ids: { id: globalBankAccountId },
            });

            if (!globalBankAccount) {
                throw new Error('Global bank account not found');
            }

            const { transformConfig, transformQuery, sampleTransformData } = globalBankAccount;

            return localUploadService.createTempFileForFn(
                {
                    file: sampleTransformData || '',
                    fileExtension: 'csv', // always csv for now
                },
                async (csvFile) => {
                    const duckdb = await DuckDBTransactionTransformSingleton.getInstance();

                    const idColumns = transformConfig?.idColumns;

                    if (!idColumns) {
                        throw new Error('ID columns are required');
                    }

                    const result = await duckdb.transformData({
                        source: {
                            type: 'csv',
                            path: csvFile,
                            options: {
                                header: true,
                                delim: transformConfig?.delimiter,
                            },
                        },
                        idConfig: {
                            columns: idColumns,
                            fieldName: 'key',
                        },
                        transformSql: transformQuery,
                        schema: transactionSchemas.validateImport.service,
                    });
                    return {
                        result: result,
                    };
                }
            );
        },
    }));
