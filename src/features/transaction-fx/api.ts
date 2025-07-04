import { apiClient, createMutation, createQuery } from '@/lib/api';

export const TRANSACTION_FX_QUERY_KEYS = {
    RATE: 'fx-rate',
    RATES: 'fx-rates',
} as const;

export const useTransactionFxEndpoints = {
    /**
     * Get exchange rate for a given currency pair and date
     * @returns The exchange rate
     */
    getRate: () =>
        createQuery(apiClient['transaction-fx'].rate.$get, TRANSACTION_FX_QUERY_KEYS.RATE),

    /**
     * Store exchange rate for a given currency pair and date
     * @returns The exchange rate
     */
    storeRate: () =>
        createMutation(apiClient['transaction-fx'].rate.$post, TRANSACTION_FX_QUERY_KEYS.RATE),

    /**
     * Store multiple exchange rates for a given currency pair and date
     * @returns The exchange rates
     */
    storeRates: () =>
        createMutation(
            apiClient['transaction-fx'].rates.batch.$post,
            TRANSACTION_FX_QUERY_KEYS.RATES
        ),

    /**
     * Convert amount from one currency to another
     * @returns The converted amount
     */
    convert: () =>
        createMutation(apiClient['transaction-fx'].convert.$post, TRANSACTION_FX_QUERY_KEYS.RATE),
};
