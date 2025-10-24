import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { bankQueries } from '@/features/bank/server/db/queries';
import { transactionSchemas } from '@/features/transaction/schemas';
import { DuckDBTransactionTransformSingleton } from '@/lib/duckdb/singleton';
import { localUploadService } from '@/lib/upload/local/service';

import { createFeatureServices } from '@/server/lib/service';

export const globalBankAccountServices = createFeatureServices('globalBankAccount')
    .registerSchemas(globalBankAccountSchemas)
    .registerQueries(bankQueries.globalBankAccount)
    .registerCoreServices()
    /**
     * Test a global bank account transformation query
     */
    .addService('testTransform', ({ queries }) => ({
        operation: 'test global bank account transformation query',
        throwOnNull: true,
        fn: async ({ globalBankAccountId }) => {
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
    }))
    .build();
