import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBankAccountQueries } from '@/features/bank/server/db/queries/connected-bank-account';
import { createFeatureServices } from '@/server/lib/service';

export const connectedBankAccountServices = createFeatureServices
    .registerSchema(connectedBankAccountSchemas)
    .registerQuery(connectedBankAccountQueries)
    .defineServices(({ queries }) => ({
        create: async (data) => {
            // const { connectedBankId, globalBankAccountId } = data;

            // if (!globalBankAccountId) {
            //     throw new Error('Global bank account ID is required');
            // }

            // // if name is not provided, use the global bank account name
            // let name: string;
            // if (!data.name) {
            //     const globalBankAccount = await bankQueries.globalBankAccount.getById({
            //         id: globalBankAccountId,
            //     });

            //     if (!globalBankAccount) {
            //         throw new Error('Global bank account not found');
            //     }

            //     name = globalBankAccount.name;
            // } else {
            //     name = data.name;
            // }

            // // Create the connected bank account
            // const connectedBankAccount = await bankQueries.connectedBankAccount.create({
            //     data: {
            //         connectedBankId,
            //         globalBankAccountId: globalBankAccountId,
            //         name,
            //         userId,
            //     },
            //     userId,
            // });

            // return connectedBankAccount;
            return {
                id: '1',
            };
        },
        /**
         * Get a connected bank account by id
         */
        getById: async (data) => await queries.getById(data),
        /**
         * Get many connected bank accounts
         */
        getMany: async (data) => await queries.getMany(data),
        /**
         * Update a connected bank account by id
         */
        updateById: async (data) => await queries.updateById(data),
        /**
         * Remove a connected bank account by id
         */
        removeById: async (data) => await queries.removeById(data),
    }));
