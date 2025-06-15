import { apiClient, createQuery } from '@/lib/api';

const GLOBAL_BANK_QUERY_KEYS = {
    GLOBAL_BANKS: 'global_banks',
    GLOBAL_BANK: 'global_bank',
} as const;

/**
 * Global Bank API endpoints with integrated error handling
 */
export const useGlobalBankEndpoints = {
    /**
     * Get all global banks or search with optional query/country filters
     */
    getAll: createQuery(apiClient.banks['global-banks'].$get, GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANKS),

    /**
     * Get global banks by country
     */
    getByCountry: createQuery(
        apiClient.banks['global-banks']['country'][':country'].$get,
        GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANKS
    ),

    /**
     * Get global bank by ID
     */
    getById: createQuery(
        apiClient.banks['global-banks'][':id'].$get,
        GLOBAL_BANK_QUERY_KEYS.GLOBAL_BANK
    ),
};
