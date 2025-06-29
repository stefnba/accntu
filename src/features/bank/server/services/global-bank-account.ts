import { TGlobalBankAccountQuerySchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountQueries, globalBankQueries } from '@/features/bank/server/db/queries';
import { TQueryInsertRecord, TQuerySelectRecords, TQueryUpdateRecord } from '@/lib/schemas';

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
const create = async ({ data }: TQueryInsertRecord<TGlobalBankAccountQuerySchemas['insert']>) => {
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
const update = async ({
    id,
    data,
}: TQueryUpdateRecord<TGlobalBankAccountQuerySchemas['update']>) => {
    return await globalBankQueries.update({ id, data });
};

/**
 * Delete a global bank account
 * @param id - The id of the global bank account
 * @returns The deleted global bank account
 */
const remove = async ({ id }: { id: string }) => {
    return await globalBankQueries.remove({ id });
};

export const globalBankAccountServices = {
    create,
    update,
    remove,
    getById,
    getAll,
};
