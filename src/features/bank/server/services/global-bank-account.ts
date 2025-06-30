import {
    TGlobalBankAccountService,
    TTestTransformQuery,
} from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountQueries } from '@/features/bank/server/db/queries';
import { transactionServiceSchemas } from '@/features/transaction/schemas';
import { DuckDBSingleton } from '@/lib/duckdb';
import {
    TQueryDeleteRecord,
    TQueryInsertRecord,
    TQuerySelectRecords,
    TQueryUpdateRecord,
} from '@/lib/schemas';
import { localUploadService } from '@/lib/upload/local/service';

/**
 * Get a global bank account by id
 * @param id - The id of the global bank account
 * @returns The global bank account
 */
const getById = async ({ id }: { id: string }) => {
    return await globalBankAccountQueries.getById({ id });
};

/**
 * Get all global bank accounts
 * @returns All global bank accounts
 */
const getAll = async ({
    filters,
}: TQuerySelectRecords<{
    globalBankId?: string;
}>) => {
    return await globalBankAccountQueries.getAll({
        filters,
    });
};

/**
 * Create a global bank account
 * @param data - The data to create the global bank account
 * @returns The created global bank account
 */
const create = async ({ data }: TQueryInsertRecord<TGlobalBankAccountService['insert']>) => {
    return await globalBankAccountQueries.create({
        data,
    });
};

/**
 * Update a global bank account
 * @param id - The id of the global bank account
 * @param data - The data to update the global bank account
 * @returns The updated global bank account
 */
const update = async ({ id, data }: TQueryUpdateRecord<TGlobalBankAccountService['update']>) => {
    return await globalBankAccountQueries.update({ id, data });
};

/**
 * Delete a global bank account
 * @param id - The id of the global bank account
 * @returns The deleted global bank account
 */
const remove = async ({ id }: TQueryDeleteRecord) => {
    return await globalBankAccountQueries.remove({ id });
};

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
const testTransformQuery = async (data: TTestTransformQuery) => {
    // save sample data to disk
    const csvFile = await localUploadService.writeFileToDisk({
        file: data.sampleTransformData,
        fileExtension: 'csv',
    });

    const duckdb = await DuckDBSingleton.getInstance();

    const idColumns = data.transformConfig.idColumns;

    if (!idColumns) {
        throw new Error('ID columns are required');
    }

    const result = await duckdb.transformData({
        source: {
            type: 'csv',
            path: csvFile,
            options: {
                header: true,
                delim: data.transformConfig.delimiter,
            },
        },
        idConfig: {
            columns: idColumns,
            fieldName: 'key',
        },
        transformSql: data.transformQuery,
        schema: transactionServiceSchemas.create,
    });

    // delete sample data from disk
    await localUploadService.deleteFileFromDisk({
        filePath: csvFile,
    });

    return {
        csvFile,
        result,
    };
};

export const globalBankAccountServices = {
    create,
    update,
    remove,
    getById,
    getAll,
    testTransformQuery,
};
