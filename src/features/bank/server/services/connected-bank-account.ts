import { TConnectedBankAccountServiceSchemas } from '@/features/bank/schemas/connected-bank-account';
import { bankQueries } from '@/features/bank/server/db/queries';
import {
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

/**
 * Create a connected bank account
 * @param userId - The id of the user
 * @param data - The data to create the connected bank account
 * @returns The created connected bank account
 */
const create = async ({
    userId,
    data,
}: TQueryInsertUserRecord<TConnectedBankAccountServiceSchemas['create']>) => {
    const { connectedBankId, globalBankAccountId } = data;

    if (!globalBankAccountId) {
        throw new Error('Global bank account ID is required');
    }

    // if name is not provided, use the global bank account name
    let name: string;
    if (!data.name) {
        const globalBankAccount = await bankQueries.globalBankAccount.getById({
            id: globalBankAccountId,
        });

        if (!globalBankAccount) {
            throw new Error('Global bank account not found');
        }

        name = globalBankAccount.name;
    } else {
        name = data.name;
    }

    // Create the connected bank account
    const connectedBankAccount = await bankQueries.connectedBankAccount.create({
        data: {
            connectedBankId,
            globalBankAccountId: globalBankAccountId,
            name,
            userId,
        },
        userId,
    });

    return connectedBankAccount;
};

/**
 * Get a connected bank account by id
 * @param id - The id of the connected bank account
 * @param userId - The id of the user
 * @returns The connected bank account
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) => {
    return await bankQueries.connectedBankAccount.getById({ id, userId });
};

/**
 * Get all connected bank accounts
 * @param userId - The id of the user
 * @returns All connected bank accounts
 */
const getAll = async ({
    userId,
    filters,
}: TQuerySelectUserRecords<{
    connectedBankId?: string;
}>) => {
    return await bankQueries.connectedBankAccount.getAll({ userId, filters });
};

/**
 * Update a connected bank account
 * @param id - The id of the connected bank account
 * @param userId - The id of the user
 * @param data - The data to update the connected bank account
 * @returns The updated connected bank account
 */
const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateUserRecord<TConnectedBankAccountServiceSchemas['update']>) => {
    return await bankQueries.connectedBankAccount.update({ id, userId, data });
};

export const connectedBankAccountServices = {
    create,
    getById,
    getAll,
    update,
};
