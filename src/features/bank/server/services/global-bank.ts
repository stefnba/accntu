import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { bankQueries } from '@/features/bank/server/db/queries';
import { createFeatureServices } from '@/server/lib/service';

export const globalBankServices = createFeatureServices
    .registerSchema(globalBankSchemas)
    .registerQuery(bankQueries.globalBank)
    .defineServices(({ queries }) => ({
        /**
         * Get a global bank by id
         */
        getById: async (input) => {
            return await queries.getById(input);
        },
        /**
         * Get all global banks
         */
        getMany: async (input) => {
            return await queries.getMany(input);
        },
        /**
         * Create a global bank
         */
        create: async (input) => {
            return await queries.create(input);
        },
        /**
         * Update a global bank
         */
        updateById: async (input) => {
            return await queries.updateById(input);
        },
        /**
         * Delete a global bank
         */
        removeById: async (input) => {
            return await queries.removeById(input);
        },
    }));
