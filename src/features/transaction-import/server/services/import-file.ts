import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFileQueries } from '@/features/transaction-import/server/db/queries/import-file';
import { transactionSchemas } from '@/features/transaction/schemas';
import { DuckDBTransactionTransformSingleton } from '@/lib/duckdb';
import { AppErrors } from '@/server/lib/error';
import { createFeatureServices } from '@/server/lib/service';

export const transactionImportFileServices = createFeatureServices('transactionImportFile')
    .registerSchema(transactionImportFileSchemas)
    .registerQueries(transactionImportFileQueries)
    .registerAllStandard()
    /**
     * Parse a transaction file
     * @param fileId - The ID of the file to parse
     * @param userId - The ID of the user who is parsing the file
     * @returns The parsed transactions
     */
    .addService('parse', () => ({
        operation: 'parse a transaction file',
        fn: async ({ fileId, userId }) => {
            const duckdb = await DuckDBTransactionTransformSingleton.getInstance();

            // get the file record
            const file = await transactionImportFileServices.getById({
                ids: { id: fileId },
                userId,
            });
            if (!file) {
                throw AppErrors.resource('NOT_FOUND', {
                    layer: 'service',
                    message: 'Import file not found',
                    details: { fileId },
                });
            }
            // get the transform config and query for the global bank account
            const globalBankAccount = file.import.connectedBankAccount.globalBankAccount;
            if (!globalBankAccount) {
                throw new Error('Global bank account not found');
            }
            const { transformQuery, transformConfig } = globalBankAccount;
            if (!transformQuery) {
                // todo: correct error factory
                throw new Error('Transform query not configured for this bank account');
            }
            if (!transformConfig) {
                // todo: correct error factory
                throw new Error('Transform config not configured for this bank account');
            }
            if (!transformConfig.type) {
                // todo: correct error factory
                throw new Error('File type not configured for this bank account');
            }

            // transform the data and save to temp table for bulk operations
            const result = await duckdb.transformData(
                {
                    source: {
                        type: transformConfig.type,
                        path: file.fileUrl,
                    },
                    transformSql: transformQuery,
                    schema: transactionSchemas.create.service.shape.data,
                    idConfig: {
                        columns: transformConfig.idColumns || [],
                        connectedBankAccountId: file.import.connectedBankAccountId,
                    },
                },
                {
                    // we need to store the validated data in a temp table for bulk operations
                    storeInTempTable: true,
                }
            );

            const { validatedData, validationErrors, tempTableName } = result;

            try {
                if (validationErrors.length > 0) {
                    console.warn(
                        `Found ${validationErrors.length} validation errors during parsing`
                    );
                }

                // if no transactions were validated, return an empty array
                if (validatedData.length === 0) {
                    return {
                        transactions: [],
                        totalCount: 0,
                        newCount: 0,
                        duplicateCount: 0,
                    };
                }

                if (!tempTableName) {
                    throw new Error('Temp table name not found');
                }

                const duplicateCheckResult = await duckdb.bulkCheckDuplicates({
                    userId,
                    connectedBankAccountId: file.import.connectedBankAccountId,
                    tempTableName,
                    transactionTableName: 'transaction',
                });

                return {
                    transactions: duplicateCheckResult,
                    totalCount: duplicateCheckResult.length,
                    newCount: duplicateCheckResult.filter((t) => !t.isDuplicate).length,
                    duplicateCount: duplicateCheckResult.filter((t) => t.isDuplicate).length,
                };
            } finally {
                // Clean up temp table
                if (tempTableName) {
                    try {
                        await duckdb.query(`DROP TABLE IF EXISTS ${tempTableName}`);
                    } catch (cleanupError) {
                        console.warn('Failed to cleanup temp table:', cleanupError);
                    }
                }
            }
        },
    }))
    .build();
