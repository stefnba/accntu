import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBankAccountQueries } from '@/features/bank/server/db/queries/connected-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { createFeatureServices } from '@/server/lib/service';

export const connectedBankAccountServices = createFeatureServices
    .registerSchema(connectedBankAccountSchemas)
    .registerQuery(connectedBankAccountQueries)
    .defineServices(({ queries }) => ({
        create: async ({ data, userId }) => {
            const { name, globalBankAccountId } = data;

            // get the global bank account
            const globalBankAccount = await globalBankAccountServices.getById({
                ids: { id: globalBankAccountId },
            });

            if (!globalBankAccount) {
                throw new Error('Global bank account not found');
            }

            const connectedBankAccount = await queries.create({
                data: {
                    ...data,
                    name: name || globalBankAccount.name,
                    type: globalBankAccount.type,
                    userId,
                },
            });

            return connectedBankAccount;
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
