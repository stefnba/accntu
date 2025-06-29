import {
    TGlobalBankAccountService,
    TTestTransformQuery,
} from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountQueries } from '@/features/bank/server/db/queries';
import {
    TQueryDeleteRecord,
    TQueryInsertRecord,
    TQuerySelectRecords,
    TQueryUpdateRecord,
} from '@/lib/schemas';

import { transactionQuerySchemas } from '@/features/transaction/schemas';
import { DuckDBSingleton } from '@/lib/duckdb';

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
 * Test a global bank account transformation query
 * @param id - The id of the global bank account
 * @param data - The data to test the global bank account transformation query
 * @returns The result of the global bank account transformation query
 */
const testTransformQuery = async (data: TTestTransformQuery) => {
    const duckdb = await DuckDBSingleton.getInstance();

    const result = await duckdb.transformData({
        source: {
            type: data?.transformConfig?.type,
            path: data.sampleTransformData,
        },
        transformSql: data.transformQuery,
        schema: transactionQuerySchemas.insert,
    });

    return {
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
