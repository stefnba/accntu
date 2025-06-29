import { TGlobalBankQuerySchemas, TSearchGlobalBanks } from '@/features/bank/schemas/global-bank';
import { globalBankQueries } from '@/features/bank/server/db/queries';
import {
    TQueryDeleteRecord,
    TQueryInsertRecord,
    TQuerySelectRecordById,
    TQuerySelectRecords,
    TQueryUpdateRecord,
} from '@/lib/schemas';

/**
 * Get a global bank by id
 * @param id - The id of the global bank
 * @returns The global bank
 */
const getById = async ({ id }: TQuerySelectRecordById) => {
    return await globalBankQueries.getById({ id });
};

/**
 * Get all global banks
 * @returns All global banks
 */
const getAll = async ({ filters }: TQuerySelectRecords<TSearchGlobalBanks>) => {
    return await globalBankQueries.getAll({
        filters,
    });
};

/**
 * Create a global bank
 * @param data - The data to create the global bank
 * @returns The created global bank
 */
const create = async ({ data }: TQueryInsertRecord<TGlobalBankQuerySchemas['insert']>) => {
    return await globalBankQueries.create({
        data,
    });
};

/**
 * Update a global bank
 * @param id - The id of the global bank
 * @param data - The data to update the global bank
 * @returns The updated global bank
 */
const update = async ({ id, data }: TQueryUpdateRecord<TGlobalBankQuerySchemas['update']>) => {
    return await globalBankQueries.update({ id, data });
};

/**
 * Delete a global bank
 * @param id - The id of the global bank
 * @returns The deleted global bank
 */
const remove = async ({ id }: TQueryDeleteRecord) => {
    return await globalBankQueries.remove({ id });
};

export const globalBankServices = {
    create,
    update,
    remove,
    getById,
    getAll,
};
