import {
    TConnectedBankQuerySchemas,
    TCreateConnectedBankWithAccounts,
} from '@/features/bank/schemas/connected-bank';
import { connectedBankQueries } from '@/features/bank/server/db/queries';
import { connectedBankAccountServices } from '@/features/bank/server/services/connected-bank-account';

/**
 * Create a new connected bank together with the related bank accounts the users wants to link to the bank.
 * @param userId - The user ID
 * @param data - The data to create the connected bank with
 * @returns The created connected bank
 */
const createConnectedBankWithAccounts = async ({
    userId,
    data,
}: {
    userId: string;
    data: TCreateConnectedBankWithAccounts;
}) => {
    const { globalBankId, connectedBankAccounts } = data;

    // Create the connected bank, if it already exists, connectedBank will be null
    let connectedBank = await connectedBankQueries.create({
        data: {
            userId,
            globalBankId,
        },
        userId,
    });

    // if no connected bank was created, get the existing one
    if (!connectedBank) {
        [connectedBank] = await connectedBankQueries.getAll({
            userId,
            filters: {
                globalBankId,
            },
        });
    }

    // if no connected bank was found, throw an error
    if (!connectedBank) {
        throw new Error('Failed to create connected bank');
    }

    // Create the connected bank accounts
    const createdAccounts = await Promise.all(
        connectedBankAccounts.map((account) =>
            connectedBankAccountServices.create({
                userId,
                data: {
                    connectedBankId: connectedBank.id,
                    globalBankAccountId: account.globalBankAccountId,
                },
            })
        )
    );

    console.log('createdAccounts', createdAccounts);

    return {
        ...connectedBank,
    };
};

/**
 * Get all connected banks for the current user
 * @param userId - The id of the user
 * @returns All connected banks
 */
const getAll = async ({ userId }: { userId: string }) => {
    return await connectedBankQueries.getAll({ userId, filters: undefined });
};

/**
 * Get a connected bank by id
 * @param id - The id of the connected bank
 * @param userId - The id of the user
 * @returns The connected bank
 */
const getById = async ({ id, userId }: { id: string; userId: string }) => {
    return await connectedBankQueries.getById({ id, userId });
};

/**
 * Update a connected bank
 * @param id - The id of the connected bank
 * @param userId - The id of the user
 * @param data - The data to update the connected bank
 * @returns The updated connected bank
 */
const update = async ({
    id,
    userId,
    data,
}: {
    id: string;
    userId: string;
    data: TConnectedBankQuerySchemas['update'];
}) => {
    return await connectedBankQueries.update({ id, userId, data });
};

/**
 * Remove a connected bank
 * @param id - The id of the connected bank
 * @param userId - The id of the user
 * @returns The removed connected bank
 */
const remove = async ({ id, userId }: { id: string; userId: string }) => {
    return await connectedBankQueries.remove({ id, userId });
};

export const connectedBankServices = {
    create: createConnectedBankWithAccounts,
    getAll,
    getById,
    update,
    remove,
};
