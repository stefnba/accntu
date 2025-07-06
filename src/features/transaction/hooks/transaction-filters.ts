import { parseAsArrayOf, parseAsIsoDate, parseAsString, useQueryStates } from 'nuqs';
import { useMemo } from 'react';

// ===================
// Types
// ===================

export type TransactionFilters = {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    labelIds?: string[];
    tagIds?: string[];
    type?: ('transfer' | 'credit' | 'debit')[];
    currencies?: string[];
};

export type TransactionTableState = {
    // Filters
    filters: TransactionFilters;
    setFilters: (
        filters: TransactionFilters | ((prev: TransactionFilters) => TransactionFilters)
    ) => void;
    resetFilters: () => void;

    // Individual filter setters for easier use
    setSearch: (search: string) => void;
    setDateRange: (startDate?: Date, endDate?: Date) => void;
    setAccountIds: (accountIds: string[]) => void;
    setLabelIds: (labelIds: string[]) => void;
    setTagIds: (tagIds: string[]) => void;
    setType: (type: ('transfer' | 'credit' | 'debit')[]) => void;
    setCurrencies: (currencies: string[]) => void;
};

// ===================
// Parsers
// ===================

const parseAsTransactionType = parseAsArrayOf(parseAsString);

const parseAsStringArray = parseAsArrayOf(parseAsString);

// ===================
// Hook
// ===================

export const useTransactionFilters = () => {
    const [filterState, setFilterState] = useQueryStates({
        search: parseAsString.withDefault(''),
        startDate: parseAsIsoDate,
        endDate: parseAsIsoDate,
        accountIds: parseAsStringArray.withDefault([]),
        labelIds: parseAsStringArray.withDefault([]),
        tagIds: parseAsStringArray.withDefault([]),
        type: parseAsTransactionType.withDefault([]),
        currencies: parseAsStringArray.withDefault([]),
    });

    // Convert URL state to our filter format
    const filters = useMemo(
        (): TransactionFilters => ({
            search: filterState.search || undefined,
            startDate: filterState.startDate || undefined,
            endDate: filterState.endDate || undefined,
            accountIds: filterState.accountIds.length ? filterState.accountIds : undefined,
            labelIds: filterState.labelIds.length ? filterState.labelIds : undefined,
            tagIds: filterState.tagIds.length ? filterState.tagIds : undefined,
            type: filterState.type.length
                ? (filterState.type as ('transfer' | 'credit' | 'debit')[])
                : undefined,
            currencies: filterState.currencies.length ? filterState.currencies : undefined,
        }),
        [filterState]
    );

    // Filter setters
    const setFilters = (
        newFilters: TransactionFilters | ((prev: TransactionFilters) => TransactionFilters)
    ) => {
        const filtersToApply = typeof newFilters === 'function' ? newFilters(filters) : newFilters;

        setFilterState({
            search: filtersToApply.search || '',
            startDate: filtersToApply.startDate || null,
            endDate: filtersToApply.endDate || null,
            accountIds: filtersToApply.accountIds || [],
            labelIds: filtersToApply.labelIds || [],
            tagIds: filtersToApply.tagIds || [],
            type: filtersToApply.type || [],
            currencies: filtersToApply.currencies || [],
        });
    };

    /**
     * Reset all filters to their default values
     */
    const resetFilters = () => {
        setFilterState({
            search: '',
            startDate: null,
            endDate: null,
            accountIds: [],
            labelIds: [],
            tagIds: [],
            type: [],
            currencies: [],
        });
    };

    /**
     * Set the search filter
     * @param search - The search string
     */
    const setSearch = (search: string) => {
        setFilterState({ search: search || '' });
    };

    const setDateRange = (startDate?: Date, endDate?: Date) => {
        setFilterState({
            startDate: startDate || null,
            endDate: endDate || null,
        });
    };

    const setAccountIds = (accountIds: string[]) => {
        setFilterState({ accountIds });
    };

    const setLabelIds = (labelIds: string[]) => {
        setFilterState({ labelIds });
    };

    const setTagIds = (tagIds: string[]) => {
        setFilterState({ tagIds });
    };

    const setType = (type: ('transfer' | 'credit' | 'debit')[]) => {
        setFilterState({ type });
    };

    const setCurrencies = (currencies: string[]) => {
        setFilterState({ currencies });
    };

    return {
        filters,
        setFilters,
        resetFilters,

        /**
         * Individual filter setters
         */
        setSearch,

        setDateRange,
        setAccountIds,
        setLabelIds,
        setTagIds,
        setType,
        setCurrencies,
    };
};
