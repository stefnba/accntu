import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';
import { connectedBankQueries } from '@/features/bank/server/db/queries/connected-bank';
import { connectedBankAccountServices } from '@/features/bank/server/services/connected-bank-account';
import { AppErrors } from '@/server/lib/error';
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
        createWithAccounts: async ({ data, userId }) => {
            const { globalBankId, connectedBankAccounts } = data;
            // return await queries.create(input);

            const newConnectedBank = await queries.create({
                data: {
                    globalBankId,
                    userId,
                },
            });

            let connectedBankId = newConnectedBank?.id;

            // if no connected bank was created, get the existing one
            if (!newConnectedBank) {
                const connectedBanks = await connectedBankQueries.queries.getMany({
                    userId,
                    filters: {
                        globalBankId,
                    },
                    pagination: {
                        page: 1,
                        pageSize: 1,
                    },
                });

                // if no connected bank was found, throw an error
                if (!connectedBanks) {
                    throw new Error('Failed to create connected bank');
                }

                connectedBankId = connectedBanks[0]?.id;
            }

            if (!connectedBankId) {
                throw AppErrors.operation('CREATE_FAILED', {
                    message: 'Failed to create connected bank',
                    layer: 'service',
                });
            }

            await Promise.all(
                connectedBankAccounts.map((account) =>
                    connectedBankAccountServices.create({
                        userId,
                        data: {
                            connectedBankId: connectedBankId!,
                            globalBankAccountId: account.globalBankAccountId,
                        },
                    })
                )
            );

            return {
                id: connectedBankId,
            };
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
            const result = await queries.getById(input);
            if (!result) {
                throw new Error('Connected bank not found');
            }
            return result;
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
