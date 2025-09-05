import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';
import { connectedBankQueries } from '@/features/bank/server/db/queries/connected-bank';
import { connectedBankAccountServices } from '@/features/bank/server/services/connected-bank-account';
import { createFeatureServices } from '@/server/lib/service';

export const connectedBankServices = createFeatureServices
    .registerSchema(connectedBankSchemas)
    .registerQuery(connectedBankQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new connected bank together with the related bank accounts the users wants to link to the bank.
         * @param userId - The user ID
         * @param data - The data to create the connected bank with
         * @returns The created connected bank
         */
        createWithAccounts: async (input) => {
            return await queries.create(input);
        },
        /**
         * Get many connected banks
         */
        getMany: async (input) => {
            return await queries.getMany(input);
        },
        /**
         * Get a connected bank by id
         */
        getById: async (input) => {
            return await queries.getById(input);
        },
        /**
         * Update a connected bank by id
         */
        updateById: async (input) => {
            return await queries.updateById(input);
        },
        /**
         * Remove a connected bank by id
         */
        removeById: async (input) => {
            return await queries.removeById(input);
        },
    }));

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
