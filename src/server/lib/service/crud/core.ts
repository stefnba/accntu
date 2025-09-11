import { ServiceHandler } from '@/server/lib/service/handler';

export const coreCrustServiceHandler = {
    // ================================
    // Get records
    // ================================

    /**
     * Get a record. If the record does not exist, throw an error.
     * @param handlerFn - The handler function to get the record
     * @returns The record
     */
    getOneRecord: async <T extends object>(handlerFn: () => Promise<T | null>) => {
        return await ServiceHandler.handle(handlerFn).validateExists();
    },

    getManyRecords: async <T extends object[]>(handlerFn: () => Promise<T[]>) => {
        return await ServiceHandler.handle(handlerFn);
    },

    // ================================
    // Create records
    // ================================

    createOneRecord: async <T extends object>(handlerFn: () => Promise<T | null>) => {
        return await ServiceHandler.handle(handlerFn).validateExists();
    },

    createManyRecords: async <T extends object[]>(handlerFn: () => Promise<T[]>) => {
        return await ServiceHandler.handle(handlerFn).validateLength(0);
    },

    // ================================
    // Update records
    // ================================

    updateOneRecord: async <T extends object>(handlerFn: () => Promise<T | null>) => {
        return await ServiceHandler.handle(handlerFn).validateExists();
    },

    updateManyRecords: async <T extends object[]>(handlerFn: () => Promise<T[]>) => {
        return await ServiceHandler.handle(handlerFn).validateLength(0);
    },

    // ================================
    // Delete records
    // ================================

    deleteOneRecord: async <T extends object>(handlerFn: () => Promise<T | null>) => {
        return await ServiceHandler.handle(handlerFn).validateExists();
    },
};
