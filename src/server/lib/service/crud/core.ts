import { ServiceHandler } from '@/server/lib/service/handler';

export const coreCrudServiceHandler = {
    // ================================
    // Get records
    // ================================

    /**
     * Get a record. If the record does not exist, throw an error.
     * @param handlerFnOrPromise - The handler function or promise to get the record
     * @returns The record
     */
    getOneRecord: async <T extends object>(
        handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise).validateExists();
    },

    getManyRecords: async <T extends object[]>(
        handlerFnOrPromise: (() => Promise<T[]>) | Promise<T[]>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise);
    },

    // ================================
    // Create records
    // ================================

    createOneRecord: async <T extends object>(
        handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise).validateExists();
    },

    createManyRecords: async <T extends object[]>(
        handlerFnOrPromise: (() => Promise<T[]>) | Promise<T[]>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise).validateLength(0);
    },

    // ================================
    // Update records
    // ================================

    updateOneRecord: async <T extends object>(
        handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise).validateExists();
    },

    updateManyRecords: async <T extends object[]>(
        handlerFnOrPromise: (() => Promise<T[]>) | Promise<T[]>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise).validateLength(0);
    },

    // ================================
    // Delete records
    // ================================

    deleteOneRecord: async <T extends object>(
        handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
    ) => {
        return await ServiceHandler.handle(handlerFnOrPromise).validateExists();
    },
};
